import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Palette, Type, Download, LogOut, Sliders, Check, Languages, HeartPulse, Bell } from 'lucide-react';

export const ProfilePrivacyView = () => {
  const {
    user,
    theme,
    setTheme,
    textSize,
    setTextSize,
    setCurrentView,
    setAuthSubView,
    orders,
    bookings,
    showToast,
    language,
    setLanguage,
    AVAILABLE_LANGUAGES,
    logoutUser,
    trackPcod,
    trackMigraine,
    updateConditionPreferences,
    t
  } = useApp();

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "femcare_health_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Personal health data exported 📥");
  };

  const themeOptions = [
    { id: 'light', name: 'Blossom Light', icon: '🌸' },
    { id: 'dark', name: 'Midnight Dark', icon: '🌙' },
    { id: 'lavender', name: 'Lavender Dream', icon: '💜' },
    { id: 'sage', name: 'Sage Calm Mint', icon: '🌿' },
    { id: 'ocean', name: 'Serene Ocean', icon: '🌊' },
    { id: 'sunset', name: 'Peach Sunset', icon: '🌅' }
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Profile Card */}
      <div 
        className="p-6 rounded-3xl border shadow-sm flex items-center gap-4 transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-2xl font-bold shadow-md">
          SP
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200">
              🔒 Private Account
            </span>
          </div>
        </div>
      </div>

      {/* SELECTABLE THEMES */}
      <div 
        className="p-5 rounded-3xl border shadow-sm space-y-4 transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Palette className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span>App Color Theme</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((t) => {
            const isSelected = theme === t.id || (t.id === 'sage' && theme === 'forest');
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected ? 'font-bold ring-2 shadow-xs' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-subcard)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-card)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-[11px] font-bold">{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Text Scaling */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
            <Type className="w-4 h-4 text-purple-500" />
            <span>{t('profile.textScaling', 'Text Scaling')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            {['normal', 'large', 'x-large'].map((size) => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={`py-2 rounded-xl border text-center capitalize transition-all ${
                  textSize === size
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DISPLAY LANGUAGE SELECTOR (Requirement 1) */}
      <div 
        className="p-5 rounded-3xl border shadow-sm space-y-3 transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Languages className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span>{t('profile.languageSelect', 'Display Language')}</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {(AVAILABLE_LANGUAGES || [
            { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧', sub: 'Default display' },
            { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', sub: 'भारतीय भाषा' },
            { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', sub: 'प्रादेशिक भाषा' },
            { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', sub: 'বাংলা ভাষা' },
            { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸', sub: 'Idioma español' },
            { code: 'it', label: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', sub: 'Lingua italiana' },
            { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', sub: 'Türk dili' }
          ]).map((lang) => {
            const isSel = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? 'border-pink-500 bg-pink-50/60 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-extrabold ring-1 ring-pink-400'
                    : 'border-[var(--border-card)] hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>{lang.flag || '🌐'}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {isSel && <span className="text-[10px] bg-pink-600 text-white rounded-full px-1.5 py-0.2">✓</span>}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {lang.label} • {lang.sub || 'Active'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SPECIAL HEALTH CONDITION TRACKING PREFERENCES (Requirement 3) */}
      <div 
        className="p-5 rounded-3xl border shadow-sm space-y-3 transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <HeartPulse className="w-4 h-4 text-rose-500" />
          <span>{t('conditions.profileTitle', 'Special Health Tracking Preferences')}</span>
        </h3>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {t('conditions.nonDiagnosticNotice', 'Tracking conditions helps monitor personal lifestyle patterns and does not replace medical diagnosis.')}
        </p>

        <div className="space-y-2.5 pt-1">
          {/* PCOD/PCOS Toggle */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>🌸 {t('conditions.enablePcod', 'Track PCOD / PCOS Profile & Symptoms')}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {t('conditions.enablePcodDesc', 'Log cycle variability, acne, skin changes, fatigue, and hormonal cues')}
              </p>
            </div>
            <button
              onClick={() => updateConditionPreferences({ trackPcod: !trackPcod, trackMigraine })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                trackPcod ? 'bg-pink-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label="Toggle PCOD Tracking"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  trackPcod ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Migraine Toggle */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>⚡ {t('conditions.enableMigraine', 'Track Migraine & Severe Headaches')}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {t('conditions.enableMigraineDesc', 'Record headache intensity, duration, triggers (sleep, stress, hydration), and relief')}
              </p>
            </div>
            <button
              onClick={() => updateConditionPreferences({ trackPcod, trackMigraine: !trackMigraine })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                trackMigraine ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label="Toggle Migraine Tracking"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  trackMigraine ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SUMMARY (Orders & Consultations) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentView('care')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1"
        >
          <div className="text-xs text-slate-400 font-medium">Consultations</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{bookings.length} Booked</div>
        </button>

        <button
          onClick={() => setCurrentView('store')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-1"
        >
          <div className="text-xs text-slate-400 font-medium">Store Orders</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{orders.length} Placed</div>
        </button>
      </div>

      {/* NOTIFICATIONS & SMART HEALTH ALERTS LINK */}
      <button
        onClick={() => setCurrentView('notifications')}
        className="w-full p-4 rounded-3xl border shadow-sm flex items-center justify-between transition-colors text-left bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-900"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Notifications & Smart Health Alerts
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Pattern status, lock screen privacy mode & reminders
            </div>
          </div>
        </div>
        <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400">Manage →</span>
      </button>

      {/* DATA CONTROLS & LOGOUT */}
      <div className="space-y-3">
        <button
          onClick={handleExportData}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between"
        >
          <span>Export Personal Health Data (JSON)</span>
          <Download className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={logoutUser}
          className="w-full py-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of FemCare</span>
        </button>
      </div>

    </div>
  );
};
