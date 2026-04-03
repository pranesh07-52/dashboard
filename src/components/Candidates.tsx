import { useEffect, useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Candidate {
  id: string;
  election_id: string;
  name: string;
  description: string;
  emoji: string;
  created_at: string;
}

interface Election {
  id: string;
  title: string;
}

export function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [formData, setFormData] = useState({
    election_id: '',
    name: '',
    description: '',
    emoji: '👤',
  });

  const commonEmojis = ['👤', '👨', '👩', '🧑', '👔', '💼', '🎯', '⭐', '🏆', '👑'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [candidatesRes, electionsRes] = await Promise.all([
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
        supabase.from('elections').select('id, title').order('created_at', { ascending: false }),
      ]);

      setCandidates(candidatesRes.data || []);
      setElections(electionsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('candidates').insert([formData]);
      if (error) throw error;

      setFormData({ election_id: '', name: '', description: '', emoji: '👤' });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  const filteredCandidates =
    selectedElection === 'all'
      ? candidates
      : candidates.filter((c) => c.election_id === selectedElection);

  const getElectionTitle = (electionId: string) => {
    return elections.find((e) => e.id === electionId)?.title || 'Unknown Election';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Candidates</h2>
          <p className="text-gray-400">Manage election candidates</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Candidate
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Election</label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Elections</option>
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.title}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Add New Candidate</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Election</label>
              <select
                value={formData.election_id}
                onChange={(e) => setFormData({ ...formData, election_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an election</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Emoji Avatar</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, emoji })}
                    className={`w-12 h-12 text-2xl rounded-lg transition-all duration-200 ${
                      formData.emoji === emoji
                        ? 'bg-blue-500/30 ring-2 ring-blue-500'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Or enter custom emoji"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Add Candidate
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
            <p className="text-gray-400">No candidates yet. Add your first candidate!</p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{candidate.emoji}</div>
                <button
                  onClick={() => handleDelete(candidate.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                  title="Delete Candidate"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{candidate.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{candidate.description}</p>
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500">{getElectionTitle(candidate.election_id)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
