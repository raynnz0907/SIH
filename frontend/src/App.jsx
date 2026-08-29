import { Routes, Route, Navigate } from 'react-router-dom';
import { useAthleteStore } from './store/athleteStore';

// Pages
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import VideoCapture from './pages/VideoCapture';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import TrainingPlan from './pages/TrainingPlan';
import RecoveryPlan from './pages/RecoveryPlan';
import Progress from './pages/Progress';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAthleteStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/onboarding" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen" style={{ background: '#000005' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};



function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/video"
        element={
          <ProtectedRoute>
            <AppLayout><VideoCapture /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:id"
        element={
          <ProtectedRoute>
            <AppLayout><Analysis /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <AppLayout><TrainingPlan /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recovery"
        element={
          <ProtectedRoute>
            <AppLayout><RecoveryPlan /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <AppLayout><Progress /></AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
