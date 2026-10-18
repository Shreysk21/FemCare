import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CommunityView } from './CommunityView';
import { HealthcareView } from './HealthcareView';
import { CircleCareView } from './CircleCareView';
import { FeedbackSection } from '../components/FeedbackSection';
import { Users, Hospital, HeartHandshake, MessageSquare } from 'lucide-react';

export const SupportView = () => {
  const { currentView, t } = useApp();
  const [activeTab, setActiveTab] = useState(
    currentView === 'care' ? 'care' : currentView === 'circle' ? 'circle' : 'community'
  );

  useEffect(() => {
    if (currentView === 'care') setActiveTab('care');
    else if (currentView === 'circle') setActiveTab('circle');
    else if (currentView === 'community') setActiveTab('community');
    else if (currentView === 'support') setActiveTab('community');
  }, [currentView]);

  return (
    <div className="space-y-4 max-w-xl mx-auto px-4 pt-4 pb-24 text-[var(--text-primary)]">
      {/* Consolidated Support Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
            <span>{t('support.title', 'Support & Circle Care')}</span>
            <span className="text-xl">🤝</span>
          </h2>
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
            {t('support.subtitle', 'Anonymous community, partner cycle sync, clinics & feedback')}
          </p>
        </div>
      </div>

      {/* Sub-View Navigation Switcher */}
      <div className="bg-[var(--bg-surface-elevated)] p-1 rounded-2xl flex gap-1 border border-[var(--border-subtle)] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'community'
              ? 'bg-[var(--bg-surface)] text-pink-600 dark:text-pink-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('support.tabSisterhood', 'Sisterhood')}</span>
        </button>

        <button
          onClick={() => setActiveTab('circle')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'circle'
              ? 'bg-[var(--bg-surface)] text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>{t('support.tabCircle', 'Circle Care')}</span>
        </button>

        <button
          onClick={() => setActiveTab('care')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'care'
              ? 'bg-[var(--bg-surface)] text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Hospital className="w-4 h-4" />
          <span>{t('support.tabClinics', 'Clinics')}</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'feedback'
              ? 'bg-[var(--bg-surface)] text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('support.tabFeedback', 'Feedback')}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {activeTab === 'community' && <CommunityView />}
        {activeTab === 'circle' && <CircleCareView />}
        {activeTab === 'care' && <HealthcareView />}
        {activeTab === 'feedback' && <FeedbackSection />}
      </div>
    </div>
  );
};

