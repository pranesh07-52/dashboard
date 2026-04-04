interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface Candidate {
  id: string;
  election_id: string;
  name: string;
  description: string;
  emoji: string;
  created_at: string;
}

interface Vote {
  id: string;
  election_id: string;
  candidate_id: string;
  created_at: string;
}

const ELECTIONS_KEY = 'decvote_elections';
const CANDIDATES_KEY = 'decvote_candidates';
const VOTES_KEY = 'decvote_votes';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const storage = {
  // Elections
  getElections: (): Election[] => {
    const data = localStorage.getItem(ELECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addElection: (election: Omit<Election, 'id' | 'created_at'>): Election => {
    const elections = storage.getElections();
    const newElection: Election = {
      ...election,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    elections.push(newElection);
    localStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections));
    return newElection;
  },

  deleteElection: (id: string): void => {
    const elections = storage.getElections().filter((e) => e.id !== id);
    localStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections));
    storage.deleteCandidatesByElection(id);
    storage.deleteVotesByElection(id);
  },

  // Candidates
  getCandidates: (): Candidate[] => {
    const data = localStorage.getItem(CANDIDATES_KEY);
    return data ? JSON.parse(data) : [];
  },

  addCandidate: (candidate: Omit<Candidate, 'id' | 'created_at'>): Candidate => {
    const candidates = storage.getCandidates();
    const newCandidate: Candidate = {
      ...candidate,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    candidates.push(newCandidate);
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
    return newCandidate;
  },

  deleteCandidate: (id: string): void => {
    const candidates = storage.getCandidates().filter((c) => c.id !== id);
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
    storage.deleteVotesByCandidate(id);
  },

  deleteCandidatesByElection: (electionId: string): void => {
    const candidates = storage
      .getCandidates()
      .filter((c) => c.election_id !== electionId);
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
  },

  // Votes
  getVotes: (): Vote[] => {
    const data = localStorage.getItem(VOTES_KEY);
    return data ? JSON.parse(data) : [];
  },

  addVote: (vote: Omit<Vote, 'id' | 'created_at'>): Vote => {
    const votes = storage.getVotes();
    const newVote: Vote = {
      ...vote,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    votes.push(newVote);
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    return newVote;
  },

  deleteVotesByCandidate: (candidateId: string): void => {
    const votes = storage.getVotes().filter((v) => v.candidate_id !== candidateId);
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  },

  deleteVotesByElection: (electionId: string): void => {
    const votes = storage.getVotes().filter((v) => v.election_id !== electionId);
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(ELECTIONS_KEY);
    localStorage.removeItem(CANDIDATES_KEY);
    localStorage.removeItem(VOTES_KEY);
  },
};
