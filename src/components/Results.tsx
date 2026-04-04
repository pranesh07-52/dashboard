import { useEffect, useState } from 'react';
import { Download, ArrowLeft, Trophy } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { storage } from '../lib/storage';

interface ResultsProps {
  electionId: string;
  electionTitle: string;
  onBack: () => void;
}

interface CandidateResult {
  id: string;
  name: string;
  emoji: string;
  votes: number;
  percentage: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function Results({ electionId, electionTitle, onBack }: ResultsProps) {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 1000);
    return () => clearInterval(interval);
  }, [electionId]);

  const loadResults = () => {
    try {
      const candidates = storage.getCandidates().filter((c) => c.election_id === electionId);
      const votes = storage.getVotes().filter((v) => v.election_id === electionId);
      const total = votes.length;

      const voteCounts = votes.reduce((acc, vote) => {
        acc[vote.candidate_id] = (acc[vote.candidate_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const resultsData = candidates.map((candidate) => {
        const voteCount = voteCounts[candidate.id] || 0;
        return {
          id: candidate.id,
          name: candidate.name,
          emoji: candidate.emoji,
          votes: voteCount,
          percentage: total > 0 ? (voteCount / total) * 100 : 0,
        };
      });

      resultsData.sort((a, b) => b.votes - a.votes);

      setResults(resultsData);
      setTotalVotes(total);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Rank', 'Candidate', 'Votes', 'Percentage'];
    const rows = results.map((result, index) => [
      index + 1,
      result.name,
      result.votes,
      `${result.percentage.toFixed(2)}%`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      `Total Votes,${totalVotes}`,
      `Election,${electionTitle}`,
      `Generated,${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${electionTitle.replace(/\s+/g, '_')}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const chartData = results.map((result) => ({
    name: result.name,
    value: result.votes,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{electionTitle}</h2>
            <p className="text-gray-400">Election Results</p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-white mb-2">{totalVotes}</p>
          <p className="text-gray-400">Total Votes Cast</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Vote Distribution</h3>
          {totalVotes > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No votes recorded yet
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Candidate Rankings</h3>
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No candidates in this election</div>
            ) : (
              results.map((result, index) => (
                <div
                  key={result.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg font-bold text-white">
                      {index === 0 ? <Trophy className="w-5 h-5" /> : index + 1}
                    </div>
                    <div className="text-3xl">{result.emoji}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{result.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-16 text-right">
                          {result.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{result.votes}</p>
                      <p className="text-xs text-gray-400">votes</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
