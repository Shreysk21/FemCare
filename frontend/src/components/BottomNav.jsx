import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Activity, BarChart2, Users } from 'lucide-react';
import { RadialFabMenu } from './RadialFabMenu';

export const BottomNav = () => {
  const { currentView, setCurrentView, t } = useApp();

  if (currentView === 'onboarding' || currentView === 'auth') {
    return null;
  }

  const leftNavItems = [
    { id: 'home', label: t('nav.home', 'Home'), icon: Home },
    { id: 'track', label: t('nav.track', 'Log & Track'), icon: Activity },
  ];

  const rightNavItems = [
    { id: 'analytics', label: t('nav.insights', 'Insights'), icon: BarChart2 },
    { id: 'support', label: t('nav.support', 'Support'), icon: Users },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) & Radial Pie Menu */}
      <RadialFabMenu />

      {/* Consolidated 4-Item Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t transition-colors"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border-card)',
          paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
          
          {/* Left Nav Group */}
          <div className="flex items-center gap-4">
            {leftNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
                    isActive
                      ? 'font-extrabold scale-105'
                      : 'hover:opacity-90 font-semibold'
                  }`}
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--bg-subcard)' : 'transparent'
                  }}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Spacer for FAB Center Button */}
          <div className="w-12 h-10 shrink-0" />

          {/* Right Nav Group */}
          <div className="flex items-center gap-4">
            {rightNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentView === item.id || (item.id === 'support' && (currentView === 'community' || currentView === 'care' || currentView === 'circle'));
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
                    isActive
                      ? 'font-extrabold scale-105'
                      : 'hover:opacity-90 font-semibold'
                  }`}
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--bg-subcard)' : 'transparent'
                  }}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </nav>
    </>
  );
};
