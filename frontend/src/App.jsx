import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Error Boundary & Hydration Gate
import AppErrorBoundary from './components/common/AppErrorBoundary';
import ProfileHydrationGate from './components/common/ProfileHydrationGate';

// Pages
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import SportAssessmentPage from './pages/SportAssessmentPage';
import VideoCapture from './pages/VideoCapture';
import Analysis from './pages/Analysis';
import Dashboard from './pages/Dashboard';
import TrainingPlan from './pages/TrainingPlan';
import RecoveryPlan from './pages/RecoveryPlan';
import Progress from './pages/Progress';

// Components
import MobileTopBar from './components/layout/MobileTopBar';
import MobileBottomNav from './components/layout/MobileBottomNav';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 relative">
      <MobileTopBar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-28 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

function App() {
  return (
    <AppErrorBoundary>
      <ProfileHydrationGate>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Athlete Dashboard */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />

          {/* Product Overview / Landing Page */}
          <Route path="/landing" element={<Landing />} />

          {/* Sport / Role Calibration */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Movement Assessment Studio */}
          <Route
            path="/assessment/:sport"
            element={
              <AppLayout>
                <SportAssessmentPage />
              </AppLayout>
            }
          />

          {/* Backward-compatible video route */}
          <Route path="/video" element={<VideoCapture />} />

          {/* Biomechanical Telemetry Report */}
          <Route
            path="/analysis/:id"
            element={
              <AppLayout>
                <Analysis />
              </AppLayout>
            }
          />

          {/* 4-Week Training Pathway */}
          <Route
            path="/plan"
            element={
              <AppLayout>
                <TrainingPlan />
              </AppLayout>
            }
          />

          {/* Strain Diagnostics & Recovery */}
          <Route
            path="/recovery"
            element={
              <AppLayout>
                <RecoveryPlan />
              </AppLayout>
            }
          />

          {/* Longitudinal Progress & Reassessment */}
          <Route
            path="/progress"
            element={
              <AppLayout>
                <Progress />
              </AppLayout>
            }
          />

          {/* Catch-all route returns cleanly to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProfileHydrationGate>
    </AppErrorBoundary>
  );
}

export default App;
