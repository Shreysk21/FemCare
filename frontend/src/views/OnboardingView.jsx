import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, Shield, ArrowRight, Check, Moon, Sun } from 'lucide-react';

export const OnboardingView = () => {
  const { onboardingStep, setOnboardingStep, setCurrentView, setUser, theme, setTheme } = useApp();

  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState('2026-09-17');
  const [notificationPrivacy, setNotificationPrivacy] = useState('discreet');

  const handleFinishOnboarding = () => {
    setUser(prev => ({
      ...prev,
      avgCycleLength: cycleLength,
      avgPeriodDuration: periodDuration,
      lastPeriodStartDate: lastPeriodDate,
      privacyMode: notificationPrivacy
    }));
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-6">
      
      {/* Progress Dots */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">FemCare</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${
                onboardingStep === step
                  ? 'w-6 bg-pink-600 dark:bg-pink-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        
        {/* SCREEN 1: Welcome */}
        {onboardingStep === 1 && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-pink-100 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800 flex items-center justify-center text-5xl shadow-xl shadow-pink-500/10">
              🌿
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Welcome to FemCare
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300">
                Understand your cycle. Track your wellness. Take care of yourself.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-left space-y-3 shadow-xs">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold">1</div>
                <span>Fast 1-tap logging for daily wellness</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold">2</div>
                <span>Zero medical diagnostic claims — private & transparent</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">3</div>
                <span>Accessible design with custom themes & discreet alerts</span>
              </div>
            </div>

            <button
              onClick={() => setOnboardingStep(2)}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SCREEN 2: Basic Cycle Information */}
        {onboardingStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Basic Cycle Setup
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Helps FemCare estimate your predicted phase. You can change this anytime.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              
              {/* Average Cycle Length */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Average Cycle Length: <span className="text-pink-600 dark:text-pink-400 text-sm">{cycleLength} days</span>
                </label>
                <input
                  type="range"
                  min="21"
                  max="40"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>21 days</span>
                  <span>28 days (avg)</span>
                  <span>40 days</span>
                </div>
              </div>

              {/* Typical Period Duration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Typical Period Duration: <span className="text-pink-600 dark:text-pink-400 text-sm">{periodDuration} days</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={periodDuration}
                  onChange={(e) => setPeriodDuration(Number(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer"
                />
              </div>

              {/* Last Period Start Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Last Period Start Date
                </label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-pink-500"
                />
              </div>

            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOnboardingStep(3)}
                className="w-1/3 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 font-semibold text-xs transition-colors"
              >
                I'll add this later
              </button>
              <button
                onClick={() => setOnboardingStep(3)}
                className="w-2/3 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* SCREEN 3: Privacy & Customization */}
        {onboardingStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Privacy & Preferences
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customize how notifications and themes work for you.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              
              {/* Notification Privacy */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Notification Privacy Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'explicit', label: 'Explicit', desc: '"Period tomorrow"' },
                    { id: 'neutral', label: 'Neutral', desc: '"FemCare reminder"' },
                    { id: 'discreet', label: 'Discreet', desc: '"Private alert"' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setNotificationPrivacy(mode.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        notificationPrivacy === mode.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 ring-2 ring-pink-400/30 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  App Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold ${
                      theme === 'light' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold ${
                      theme === 'dark' ? 'border-pink-500 bg-slate-800 text-pink-300' : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Privacy Guarantee Notice */}
              <div className="bg-teal-50 dark:bg-teal-950/50 p-3 rounded-xl border border-teal-200 dark:border-teal-800/60 flex items-start gap-2.5 text-xs text-teal-800 dark:text-teal-300">
                <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Your health information is private.</strong> You control what you record and what notifications you receive.
                </p>
              </div>

            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Start Using FemCare</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>

      <div className="text-center text-xs text-slate-400 font-medium">
        FemCare HCI Project Prototype • Responsive Mobile-First
      </div>

    </div>
  );
};
