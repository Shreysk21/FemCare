import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { CrampSosModal } from './components/CrampSosModal';

import { OnboardingView } from './views/OnboardingView';
import { AuthView } from './views/AuthView';
import { HomeDashboard } from './views/HomeDashboard';
import { CycleView } from './views/CycleView';
import { TrackView } from './views/TrackView';
import { AnalyticsView } from './views/AnalyticsView';
import { SupportView } from './views/SupportView';
import { WellnessStoreView } from './views/WellnessStoreView';
import { AiAssistantView } from './views/AiAssistantView';
import { NotificationsView } from './views/NotificationsView';
import { ProfilePrivacyView } from './views/ProfilePrivacyView';

const MainContent = () => {
  const { currentView, textSize } = useApp();

  const getTextScaleClass = () => {
    if (textSize === 'large') return 'text-[105%]';
    if (textSize === 'x-large') return 'text-[115%]';
    return '';
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors ${getTextScaleClass()}`}>
      {currentView !== 'onboarding' && currentView !== 'auth' && <Navbar />}

      <main className="min-h-[calc(100vh-130px)]">
        {currentView === 'onboarding' && <OnboardingView />}
        {currentView === 'auth' && <AuthView />}
        {currentView === 'home' && <HomeDashboard />}
        {currentView === 'cycle' && <CycleView />}
        {currentView === 'track' && <TrackView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {(currentView === 'support' || currentView === 'community' || currentView === 'care' || currentView === 'circle') && <SupportView />}
        {currentView === 'store' && <WellnessStoreView />}
        {currentView === 'ai' && <AiAssistantView />}
        {currentView === 'notifications' && <NotificationsView />}
        {currentView === 'profile' && <ProfilePrivacyView />}
      </main>

      <CrampSosModal />
      <BottomNav />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
