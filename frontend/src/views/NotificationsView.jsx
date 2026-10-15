import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Shield, Eye, Lock, Check } from 'lucide-react';

export const NotificationsView = () => {
  const { privacyMode, setNotificationPrivacyMode, notificationPrefs, toggleNotificationPref } = useApp();

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Notifications & Privacy</span>
          <span className="text-xl">🔔</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure discreet notification styles and reminder schedules
        </p>
      </div>

      {/* PRIVACY LEVEL MODE SELECTOR (Explicit vs Neutral vs Discreet) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-pink-500" />
            <span>Lock Screen Notification Privacy Mode</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose how sensitive period reminders appear on your phone lock screen
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: 'explicit',
              title: 'Explicit Mode',
              preview: '"Your period may start tomorrow."',
              desc: 'Displays exact menstrual cycle terminology.'
            },
            {
              id: 'neutral',
              title: 'Neutral Mode',
              preview: '"Your FemCare reminder is ready."',
              desc: 'Displays standard app notification title.'
            },
            {
              id: 'discreet',
              title: 'Discreet Mode (Recommended)',
              preview: '"You have a private reminder."',
              desc: 'Hides all health details for maximum privacy on lock screen.'
            }
          ].map((mode) => {
            const isSelected = privacyMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setNotificationPrivacyMode(mode.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/60 ring-2 ring-pink-400/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{mode.title}</span>
                    {isSelected && <span className="text-[10px] bg-pink-600 text-white font-bold px-2 py-0.5 rounded-full">Active</span>}
                  </div>
                  <div className="text-xs font-semibold text-pink-700 dark:text-pink-300 mt-1 italic">
                    Preview: {mode.preview}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {mode.desc}
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                  isSelected ? 'bg-pink-600 border-pink-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INDIVIDUAL REMINDER TOGGLES */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Reminder Preferences
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notificationPrefs.map((pref) => (
            <div key={pref.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{pref.name}</div>
                <div className="text-[10px] text-slate-400">{pref.time}</div>
              </div>

              <button
                onClick={() => toggleNotificationPref(pref.id)}
                className={`w-12 h-6 rounded-full transition-colors p-1 relative ${
                  pref.enabled ? 'bg-pink-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label={`Toggle ${pref.name}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  pref.enabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
