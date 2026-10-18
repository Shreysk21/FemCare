import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Palette, Bot, User, Eye, EyeOff, HeartHandshake, Languages, Bell } from 'lucide-react';
import { Modal } from './Modal';
import { FsmLoggingModal } from './FsmLoggingModal';

export const Navbar = () => {
  const {
    currentView,
    setCurrentView,
    theme,
    setTheme,
    cart,
    privacyShield,
    togglePrivacyShield,
    isLoading,
    language,
    setLanguage,
    smartAlertData,
    t
  } = useApp();

  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const themesList = [
    { id: 'light', name: 'Blossom Light', icon: '🌸', desc: 'Soft warm rose-white' },
    { id: 'dark', name: 'Midnight Dark', icon: '🌙', desc: 'True OLED slate dark' },
    { id: 'lavender', name: 'Lavender Dream', icon: '💜', desc: 'Soft purple violet' },
    { id: 'sage', name: 'Sage Calm Mint', icon: '🌿', desc: 'Calming emerald mint' },
    { id: 'ocean', name: 'Serene Ocean', icon: '🌊', desc: 'Refreshing teal tone' },
    { id: 'sunset', name: 'Peach Sunset', icon: '🌅', desc: 'Warm amber sunset' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
            role="button"
            aria-label="FemCare Home"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <span className="text-lg">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-teal-600 bg-clip-text text-transparent leading-none">
                  {t('nav.appName', 'FemCare')}
                </h1>
                {isLoading ? (
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" title="Syncing with database..." />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected to persistent database" />
                )}
              </div>
              <p className="text-[9px] font-bold text-[var(--text-secondary)] tracking-wider uppercase flex items-center gap-1 mt-0.5">
                <span>{t('nav.subtitle', "Women's Health & Wellness")}</span>
              </p>
            </div>
          </div>

          {/* Clean Utility Action Group */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Switcher Button (1-Tap Toggle between English & Hindi) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-bold shadow-2xs hover:scale-105 active:scale-95"
              title={language === 'en' ? "हिन्दी में बदलें (Switch to Hindi)" : "Switch to English"}
              aria-label="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span className="text-[11px] font-extrabold text-pink-600 dark:text-pink-400">
                {language === 'en' ? 'हिन्दी' : 'EN'}
              </span>
            </button>

            {/* Circle Care Partner Sync Header Access */}
            <button
              onClick={() => setCurrentView('support')}
              className={`p-2 rounded-full border transition-all flex items-center gap-1 ${
                currentView === 'support' || currentView === 'circle'
                  ? 'bg-pink-100 dark:bg-pink-950 border-pink-400 text-pink-600 dark:text-pink-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100'
              }`}
              title="Circle Care & Partner Sync"
              aria-label="Circle Care Partner Sync"
            >
              <HeartHandshake className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="text-[11px] font-bold hidden md:inline">{t('nav.circle', 'Circle')}</span>
            </button>

            {/* Privacy Shield Toggle */}
            <button
              onClick={togglePrivacyShield}
              className={`p-2 rounded-full border transition-all flex items-center gap-1.5 ${
                privacyShield
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100'
              }`}
              title={privacyShield ? "Privacy Shield Active (Hover to reveal details)" : "Enable Privacy Shield"}
              aria-label="Toggle Privacy Shield"
            >
              {privacyShield ? (
                <EyeOff className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              )}
              <span className="text-[11px] font-bold hidden sm:inline">
                {privacyShield ? t('nav.shieldOn', 'Shield ON') : t('nav.privacy', 'Privacy')}
              </span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setCurrentView('ai')}
              className={`p-2 rounded-full border transition-all ${
                currentView === 'ai'
                  ? 'bg-purple-100 dark:bg-purple-950 border-purple-400 text-purple-600 dark:text-purple-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100'
              }`}
              title="AI Wellness Assistant"
              aria-label="AI Assistant"
            >
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>

            {/* Wellness Store Cart Button */}
            <button
              onClick={() => setCurrentView('store')}
              className={`p-2 rounded-full border transition-all relative ${
                currentView === 'store'
                  ? 'bg-pink-100 dark:bg-pink-950 border-pink-400 text-pink-600 dark:text-pink-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100'
              }`}
              title="Wellness Store"
              aria-label="Wellness Store"
            >
              <ShoppingBag className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* Notifications & Smart Alerts Button */}
            <button
              onClick={() => setCurrentView('notifications')}
              className={`p-2 rounded-full border transition-all relative ${
                currentView === 'notifications'
                  ? 'bg-pink-100 dark:bg-pink-950 border-pink-400 text-pink-600 dark:text-pink-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100'
              }`}
              title="Notifications & Smart Alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              {smartAlertData?.hasAlert && (
                <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${smartAlertData.status === 'urgent' ? 'bg-rose-600 animate-ping' : 'bg-amber-500'}`} />
              )}
            </button>

            {/* Theme Palette Button */}
            <button
              onClick={() => setThemeModalOpen(true)}
              className="p-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100 transition-colors"
              aria-label="Change Theme"
              title="App Theme"
            >
              <Palette className="w-4 h-4 text-pink-500" />
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setCurrentView('profile')}
              className={`p-2 rounded-full border transition-all ${
                currentView === 'profile'
                  ? 'bg-pink-100 dark:bg-pink-950 border-pink-400 text-pink-600 dark:text-pink-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-slate-100'
              }`}
              aria-label="Profile and Settings"
            >
              <User className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* THEME SELECTOR MODAL */}
      <Modal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        title="Select App Theme"
      >
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Choose your preferred color theme. The entire app will adapt immediately.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {themesList.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setThemeModalOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  (theme === t.id || (t.id === 'sage' && theme === 'forest'))
                    ? 'ring-2 ring-rose-400 font-bold shadow-sm'
                    : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: (theme === t.id || (t.id === 'sage' && theme === 'forest')) ? 'var(--bg-subcard)' : 'var(--bg-card)',
                  borderColor: (theme === t.id || (t.id === 'sage' && theme === 'forest')) ? 'var(--accent-primary)' : 'var(--border-card)'
                }}
              >
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* FSM LOGGING MODAL */}
      <FsmLoggingModal />
    </>
  );
};
