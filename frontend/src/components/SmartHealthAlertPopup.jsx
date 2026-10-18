import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, AlertCircle, PhoneCall, ExternalLink, X, Activity, ShieldAlert } from 'lucide-react';

export const SmartHealthAlertPopup = () => {
  const {
    activeSmartAlert,
    dismissSmartAlert,
    acknowledgeUrgentAlert,
    setCurrentView,
    setActiveTrackTab,
    t
  } = useApp();

  if (!activeSmartAlert) return null;

  const isUrgent = activeSmartAlert.level === 'urgent';

  const handleViewDetails = () => {
    // Navigate to tracking view to review actual records
    setCurrentView('track');
    if (activeSmartAlert.patternType === 'frequent_migraine') {
      setActiveTrackTab('conditions');
    } else {
      setActiveTrackTab('symptoms');
    }
    // Dismiss the floating popup after navigating to view details
    dismissSmartAlert(activeSmartAlert.signature);
  };

  // 1. URGENT SAFETY GUIDANCE MODAL (Requirement 3)
  // For recognised emergency warning signs: high visibility, cannot be treated as a casual dismissible reminder
  if (isUrgent) {
    return createPortal(
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="urgent-alert-title"
        aria-describedby="urgent-alert-desc"
      >
        <div className="bg-white dark:bg-slate-900 border-2 border-rose-600 dark:border-rose-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
          
          {/* Urgent Header */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse text-rose-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('smartAlerts.urgentTitle', 'Urgent Medical Guidance')}</span>
              </div>
              <h3 id="urgent-alert-title" className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {activeSmartAlert.title}
              </h3>
            </div>
          </div>

          {/* Explanation & Clinical Observation */}
          <div id="urgent-alert-desc" className="space-y-3 bg-rose-50/70 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
            <p className="font-semibold">{activeSmartAlert.message}</p>
            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/50 flex items-start gap-2">
              <span className="font-bold shrink-0">Required Action:</span>
              <span>{activeSmartAlert.recommendation}</span>
            </div>
          </div>

          {/* Emergency Safety Guidance Actions */}
          <div className="space-y-2.5 pt-1">
            <a
              href="tel:112"
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('smartAlerts.callEmergency', 'Call Emergency Services (112 / 911)')}</span>
            </a>

            <button
              onClick={() => acknowledgeUrgentAlert(activeSmartAlert.signature)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              {t('smartAlerts.acknowledgeCare', 'I Understand & Will Seek Immediate Care')}
            </button>
          </div>

          {/* Critical Disclaimer: Dismissal does NOT imply safety */}
          <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center leading-normal">
            <span className="font-semibold block text-rose-600 dark:text-rose-400 mb-0.5">Safety Notice:</span>
            {t('smartAlerts.urgentNoticeWarning', 'Dismissing this notice does not indicate symptoms have resolved or that it is safe to delay care. Please contact emergency services or a healthcare professional immediately.')}
          </div>

        </div>
      </div>,
      document.body
    );
  }

  // 2. CALM, DISMISSIBLE POPUP FOR CONCERNING PATTERNS (Requirement 2 & 4)
  // Small, clear, non-intrusive floating popup with View Details and Dismiss
  return createPortal(
    <div
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-[90] animate-fade-in"
      role="region"
      aria-label="Health Pattern Alert"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200 dark:border-amber-900/60 shadow-2xl rounded-3xl p-4 md:p-5 relative space-y-3">
        
        {/* Header with dismiss X */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {t('smartAlerts.titleNotice', 'Health Pattern Notice')}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {activeSmartAlert.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => dismissSmartAlert(activeSmartAlert.signature)}
            aria-label="Dismiss alert"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Observation details & suggested next step */}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-1.5">
          <p>{activeSmartAlert.message}</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Suggested next step: {activeSmartAlert.recommendation}
          </p>
        </div>

        {/* Actions: View Details and Dismiss */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2 px-3 bg-pink-600 hover:bg-pink-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('smartAlerts.viewDetails', 'View Details')}</span>
          </button>

          <button
            onClick={() => dismissSmartAlert(activeSmartAlert.signature)}
            className="py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
          >
            {t('smartAlerts.dismiss', 'Dismiss')}
          </button>
        </div>

        {/* Footer: Non-diagnostic assurance */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
          {t('smartAlerts.disclaimer', 'Based on your saved records. Non-diagnostic observation.')}
        </div>

      </div>
    </div>,
    document.body
  );
};
