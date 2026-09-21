import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AddLeadModal } from './components/modals/AddLeadModal';
import { QuickChatModal } from './components/modals/QuickChatModal';
import { Toast } from './components/common/Toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { AgentsPage } from './pages/AgentsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentRoute, isAuthenticated, navigate } = useApp();

  // If user is ALREADY authenticated and tries to access public pages, send them to dashboard
  React.useEffect(() => {
    if (isAuthenticated && ['landing', 'login', 'signup', 'register'].includes(currentRoute)) {
      // Force URL change and state update
      window.history.replaceState({}, '', '/dashboard');
      navigate('dashboard');
    }
  }, [isAuthenticated, currentRoute, navigate]);

  // If user is accessing login or signup/register directly (and is not authenticated)
  if (!isAuthenticated) {
    if (currentRoute === 'landing') {
      return <LandingPage />;
    }
    if (currentRoute === 'signup' || currentRoute === 'register') {
      return <SignupPage />;
    }
    // Any other route while logged out forces them to the Login page
    return <LoginPage />;
  }

  // If they are authenticated, but somehow the route is still public (before the useEffect kicks in), render nothing or a spinner
  if (['landing', 'login', 'signup', 'register'].includes(currentRoute)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area Offset by Sidebar width */}
      <div className="pl-60 w-full flex flex-col min-h-screen">
        {/* Fixed Top Bar */}
        <Header />

        {/* Dynamic Route View */}
        <main className="relative pt-16 bg-surface-container-low min-h-screen w-full">
          {currentRoute === 'dashboard' && <DashboardPage />}
          {currentRoute === 'all-leads' && <LeadsPage />}
          {currentRoute === 'hot-leads' && <LeadsPage initialFilter="Hot" />}
          {currentRoute === 'at-risk-leads' && <LeadsPage initialFilter="At-Risk" />}
          {currentRoute === 'lead-details' && <LeadDetailPage />}
          {currentRoute === 'follow-ups' && <FollowUpsPage />}
          {currentRoute === 'agents' && <AgentsPage />}
          {currentRoute === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Interactive Modals & Toast */}
      <AddLeadModal />
      <QuickChatModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
