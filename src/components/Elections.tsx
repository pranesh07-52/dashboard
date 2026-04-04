import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, Calendar } from 'lucide-react';
import { storage } from '../lib/storage';

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface ElectionsProps {
  onViewResults: (electionId: string, electionTitle: string) => void;
}

export function Elections({ onViewResults }: ElectionsProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = () => {
    try {
      const data = storage.getElections();
      setElections([...data].reverse());
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      storage.addElection(formData);
      setFormData({ title: '', description: '', start_date: '', end_date: '' });
      setShowForm(false);
      loadElections();
    } catch (error) {
      console.error('Error creating election:', error);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this election?')) return;

    try {
      storage.deleteElection(id);
      loadElections();
    } catch (error) {
      console.error('Error deleting election:', error);
    }
  };

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);

    if (now < start) return { text: 'Upcoming', color: 'text-yellow-400 bg-yellow-400/10' };
    if (now > end) return { text: 'Ended', color: 'text-gray-400 bg-gray-400/10' };
    return { text: 'Active', color: 'text-green-400 bg-green-400/10' };
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
          <h2 className="text-3xl font-bold text-white mb-2">Elections</h2>
          <p className="text-gray-400">Manage your elections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Election
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Create New Election</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter election title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter election description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Create Election
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

      <div className="grid grid-cols-1 gap-4">
        {elections.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
            <p className="text-gray-400">No elections yet. Create your first election!</p>
          </div>
        ) : (
          elections.map((election) => {
            const status = getElectionStatus(election);
            return (
              <div
                key={election.id}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{election.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{election.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(election.start_date).toLocaleDateString()} -{' '}
                          {new Date(election.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onViewResults(election.id, election.title)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                      title="View Results"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(election.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                      title="Delete Election"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
