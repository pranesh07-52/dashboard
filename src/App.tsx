import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Elections } from './components/Elections';
import { Candidates } from './components/Candidates';
import { Results } from './components/Results';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [resultsView, setResultsView] = useState<{
    electionId: string;
    electionTitle: string;
  } | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleViewResults = (electionId: string, electionTitle: string) => {
    setResultsView({ electionId, electionTitle });
  };

  const handleBackFromResults = () => {
    setResultsView(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {resultsView ? (
            <Results
              electionId={resultsView.electionId}
              electionTitle={resultsView.electionTitle}
              onBack={handleBackFromResults}
            />
          ) : currentView === 'dashboard' ? (
            <Dashboard />
          ) : currentView === 'elections' ? (
            <Elections onViewResults={handleViewResults} />
          ) : currentView === 'candidates' ? (
            <Candidates />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
