import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Droplets, HeartPulse, Smile, Activity, Sparkles } from 'lucide-react';

export const RadialFabMenu = () => {
  const {
    radialMenuOpen,
    setRadialMenuOpen,
    addHydrationMl,
    addSymptom,
    addMoodLog,
    setCurrentView,
    setFsmLoggingModalOpen,
    transitionFSM
  } = useApp();

  // Radial Menu Options: Equal Distance D = 88px, Target Width W = 56px
  // Index of Difficulty ID = log2(2D/W) = log2(176/56) ≈ 1.65 bits
  const actions = [
    {
      id: 'flow',
      label: 'Log Flow',
      icon: '🩸',
      color: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40',
      angle: -135, // Top-Left
      onClick: () => {
        setRadialMenuOpen(false);
        setFsmLoggingModalOpen(true);
        transitionFSM('PROMPT_SYMPTOM', 'START_FLOW_LOG');
      }
    },
    {
      id: 'cramps',
      label: 'Log Cramps',
      icon: '🩺',
      color: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/40',
      angle: -45, // Top-Right
      onClick: () => {
        addSymptom('Abdominal Cramps', 'Pain & Discomfort', 'Moderate', 'Logged via Quick Radial Pie Menu');
        setRadialMenuOpen(false);
      }
    },
    {
      id: 'mood',
      label: 'Log Mood',
      icon: '😊',
      color: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/40',
      angle: -175, // Far Left
      onClick: () => {
        addMoodLog({ id: 'happy', label: 'Happy & Energetic', emoji: '😊' }, 'Logged via Quick Radial Pie Menu');
        setRadialMenuOpen(false);
      }
    },
    {
      id: 'water',
      label: 'Add Water',
      icon: '💧',
      color: 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/40',
      angle: 5, // Far Right
      onClick: () => {
        addHydrationMl(250);
        setRadialMenuOpen(false);
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
            
            {/* Fitts' Law Math Explanation Badge */}
            <div className="absolute -top-24 bg-purple-950/95 text-white text-[11px] px-3.5 py-1.5 rounded-full border border-purple-400/50 shadow-xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>
                Fitts' Law Optimised: <strong className="text-amber-300 font-mono">ID = log₂ (2D / W) = 1.6 bits</strong>
              </span>
            </div>

            {/* Radial Pie Wedges */}
            {actions.map((act) => {
              const radius = 88; // Radial Distance D = 88px
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
                    className={`w-14 h-14 rounded-full ${act.color} shadow-lg flex items-center justify-center text-2xl transform transition-transform group-hover:scale-115 group-active:scale-95 border-2 border-white/80 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-pink-400/50`}
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
        className={`relative z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-600/40 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-400 ${
          radialMenuOpen ? 'rotate-45 scale-110 ring-4 ring-purple-400/60' : 'hover:scale-110 active:scale-95'
        }`}
        aria-label="Toggle Quick Radial Logging Menu"
        title="Fitts' Law Radial Quick Log Menu"
      >
        <Plus className="w-7 h-7 stroke-[3px]" />
      </button>
    </div>
  );
};
