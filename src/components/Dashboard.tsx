import { useEffect, useState } from 'react';
import { Vote, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../lib/storage';

interface Stats {
  totalVotes: number;
  totalCandidates: number;
  activeElections: number;
  totalElections: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalVotes: 0,
    totalCandidates: 0,
    activeElections: 0,
    totalElections: 0,
  });
  const [chartData, setChartData] = useState<Array<{ name: string; votes: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    try {
      const elections = storage.getElections();
      const candidates = storage.getCandidates();
      const votes = storage.getVotes();

      const now = new Date();
      const activeElections = elections.filter((e) => {
        const start = new Date(e.start_date);
        const end = new Date(e.end_date);
        return start <= now && now <= end;
      }).length;

      setStats({
        totalVotes: votes.length,
        totalCandidates: candidates.length,
        activeElections,
        totalElections: elections.length,
      });

      const recentElections = elections.slice(0, 5);
      const chartData = recentElections.map((election) => {
        const electionVotes = votes.filter((v) => v.election_id === election.id);
        return {
          name: election.title.substring(0, 15),
          votes: electionVotes.length,
        };
      });
      setChartData(chartData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Votes',
      value: stats.totalVotes,
      icon: Vote,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Active Elections',
      value: stats.activeElections,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Elections',
      value: stats.totalElections,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400">Overview of your voting system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Elections Activity</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="votes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            No election data available
          </div>
        )}
      </div>
    </div>
  );
}
