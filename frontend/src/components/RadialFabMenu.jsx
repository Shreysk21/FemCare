import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

export const RadialFabMenu = () => {
  const {
    radialMenuOpen,
    setRadialMenuOpen,
    setCurrentView,
    setFsmLoggingModalOpen,
    transitionFSM,
    setActiveTrackTab,
    t
  } = useApp();

  // Radial quick-action items positioned along an upper semi-circular arc (D = 90px)
  const actions = [
    {
      id: 'flow',
      label: t('fab.logPeriod', 'Log Period'),
      icon: '🩸',
      color: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40',
      angle: -160,
      onClick: () => {
        setRadialMenuOpen(false);
        if (setActiveTrackTab) setActiveTrackTab('flow');
        setCurrentView('track');
      }
    },
    {
      id: 'symptoms',
      label: t('fab.logSymptoms', 'Log Symptoms'),
      icon: '🩺',
      color: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/40',
      angle: -125,
      onClick: () => {
        setRadialMenuOpen(false);
        if (setActiveTrackTab) setActiveTrackTab('symptoms');
        setCurrentView('track');
      }
    },
    {
      id: 'mood',
      label: t('fab.logMood', 'Log Mood'),
      icon: '😊',
      color: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/40',
      angle: -90,
      onClick: () => {
        setRadialMenuOpen(false);
        if (setActiveTrackTab) setActiveTrackTab('mood');
        setCurrentView('track');
      }
    },
    {
      id: 'migraine',
      label: t('fab.logMigraine', 'Log Migraine'),
      icon: '⚡',
      color: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/40',
      angle: -55,
      onClick: () => {
        setRadialMenuOpen(false);
        if (setActiveTrackTab) setActiveTrackTab('migraine');
        setCurrentView('track');
      }
    },
    {
      id: 'pcod',
      label: t('fab.logPcod', 'Log PCOD'),
      icon: '🌸',
      color: 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/40',
      angle: -20,
      onClick: () => {
        setRadialMenuOpen(false);
        if (setActiveTrackTab) setActiveTrackTab('pcod');
        setCurrentView('track');
      }
    }
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      
      {/* Radial Pie Menu Overlay */}
      {radialMenuOpen && (
        <>
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 animate-fade-in"
            onClick={() => setRadialMenuOpen(false)}
          />

          {/* Radial Container */}
          <div className="relative z-50 mb-14 flex items-center justify-center animate-scale-up">
            {/* Radial Pie Wedges */}
            {actions.map((act) => {
              const radius = 90; // Radial Distance D = 90px
              const rad = (act.angle * Math.PI) / 180;
              const x = Math.round(radius * Math.cos(rad));
              const y = Math.round(radius * Math.sin(rad));

              return (
                <div
                  key={act.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  className="absolute flex flex-col items-center group transition-all duration-300"
                >
                  <button
                    onClick={act.onClick}
                    className={`w-14 h-14 rounded-full ${act.color} shadow-lg flex items-center justify-center text-2xl transform transition-transform group-hover:scale-115 group-active:scale-95 border-2 border-white/80 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-400/50 cursor-pointer`}
                    aria-label={act.label}
                  >
                    <span>{act.icon}</span>
                  </button>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100">
                    {act.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Main Floating Quick-Action Button (FAB) */}
      <button
        onClick={() => setRadialMenuOpen(!radialMenuOpen)}
        className={`relative z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-600/40 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-400 cursor-pointer ${
          radialMenuOpen ? 'rotate-45 scale-110 ring-4 ring-purple-400/60' : 'hover:scale-110 active:scale-95'
        }`}
        aria-label="Toggle Quick Radial Logging Menu"
        title="Quick Log Actions"
      >
        <Plus className="w-7 h-7 stroke-[3px]" />
      </button>
    </div>
  );
};
