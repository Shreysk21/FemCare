import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell, Shield, Eye, Lock, Check, Activity, AlertTriangle, AlertCircle,
  ShieldAlert, CheckCircle2, RefreshCw, ExternalLink, PhoneCall,
  HeartHandshake, CheckCheck, Trash2, Mail, Clock, X
} from 'lucide-react';

export const NotificationsView = () => {
  const {
    privacyMode,
    setNotificationPrivacyMode,
    notificationPrefs,
    toggleNotificationPref,
    smartAlertData,
    evaluateSmartHealthAlerts,
    resetSmartAlertThrottles,
    setCurrentView,
    setActiveTrackTab,
    inAppNotifications,
    notificationsLoading,
    unreadNotificationCount,
    fetchInAppNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    respondToCircleShare
  } = useApp();

  const [respondingId, setRespondingId] = useState(null);

  const handleRespond = async (shareId, action, notifId) => {
    setRespondingId(notifId);
    try {
      await respondToCircleShare(shareId, action);
      await markNotificationRead(notifId);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <span>Notifications & Privacy</span>
            <span className="text-xl">🔔</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
            Partner sharing requests, smart health alerts & privacy preferences
          </p>
        </div>
        <button
          onClick={() => fetchInAppNotifications()}
          disabled={notificationsLoading}
          className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] hover:text-pink-600 transition-colors"
          title="Refresh notifications"
        >
          <RefreshCw className={`w-4 h-4 ${notificationsLoading ? 'animate-spin text-pink-600' : ''}`} />
        </button>
      </div>

      {/* 1. IN-APP NOTIFICATIONS INBOX (PARTNER REQUESTS & REAL-TIME ALERTS) */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <span>In-App Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="text-[10px] bg-pink-600 text-white font-black px-2 py-0.5 rounded-full">
                    {unreadNotificationCount} unread
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                Incoming sharing requests, partner gestures & status updates
              </p>
            </div>
          </div>

          {inAppNotifications.length > 0 && unreadNotificationCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {inAppNotifications.length === 0 ? (
          <div className="p-6 text-center bg-[var(--bg-surface-elevated)] rounded-2xl border border-[var(--border-subtle)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
            <div className="text-xs font-extrabold text-[var(--text-primary)]">You're All Caught Up! ✨</div>
            <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto">
              When a partner or sisterhood member sends a data sharing request, it will appear right here for your approval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inAppNotifications.map((n) => {
              const isUnread = n.status === 'unread';
              const isPartnerRequest = n.type === 'partner_share_request';
              const data = n.data || {};

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isUnread
                      ? 'border-pink-300 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/30 shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] opacity-95'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPartnerRequest
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                          : 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400'
                      }`}>
                        {isPartnerRequest ? <HeartHandshake className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                            {n.title}
                          </h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" title="Unread" />
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mt-0.5">
                          {n.message}
                        </p>
                        {n.createdAt && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isUnread && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* PARTNER SHARE REQUEST: PERMISSIONS BADGES & ACCEPT/DECLINE CONTROLS */}
                  {isPartnerRequest && n.referenceId && (
                    <div className="pt-2.5 border-t border-[var(--border-subtle)] space-y-3">
                      {data.permissions && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">
                            Requested Data Permissions:
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                            {data.permissions.phaseAndWindow && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                ✓ Cycle Phase & Window
                              </span>
                            )}
                            {data.permissions.emotionalState && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                ✓ Mood & Comfort Needs
                              </span>
                            )}
                            {data.permissions.specificSymptoms && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                ✓ Logged Symptoms
                              </span>
                            )}
                            {data.permissions.privateNotes ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                ✓ Private Notes Included
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                🔒 Private Notes Redacted
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Accept / Decline Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          disabled={respondingId === n.id}
                          onClick={() => handleRespond(n.referenceId, 'accept', n.id)}
                          className="flex-1 py-2 px-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>

                        <button
                          disabled={respondingId === n.id}
                          onClick={() => handleRespond(n.referenceId, 'decline', n.id)}
                          className="flex-1 py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PRIVACY LEVEL MODE SELECTOR (Explicit vs Neutral vs Discreet) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-pink-500" />
            <span>Lock Screen Notification Privacy Mode</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
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
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">
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
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Reminder Preferences
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notificationPrefs.map((pref) => (
            <div key={pref.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{pref.name}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{pref.time}</div>
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

      {/* SMART HEALTH ALERTS PATTERN MONITORING */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-950/80 border border-pink-300 dark:border-pink-800 text-pink-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Smart Health Alerts
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Evidence-based pattern analysis across saved symptom records
              </p>
            </div>
          </div>

          <button
            onClick={() => evaluateSmartHealthAlerts()}
            title="Check for pattern changes"
            className="p-2 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Status Display */}
        {smartAlertData?.status === 'urgent' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
              <span>Emergency Warning Sign Detected</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {smartAlertData.alert?.title}
            </div>
            <div className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
              {smartAlertData.alert?.message}
            </div>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 pt-1 border-t border-rose-200 dark:border-rose-900">
              Action: {smartAlertData.alert?.recommendation}
            </div>
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Emergency Services (112 / 911)</span>
            </a>
          </div>
        )}

        {smartAlertData?.status === 'concerning' && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Concerning Pattern Observed</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {smartAlertData.alert?.title}
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {smartAlertData.alert?.message}
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1 border-t border-amber-200 dark:border-amber-900/40">
              Suggested next step: {smartAlertData.alert?.recommendation}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setCurrentView('track');
                  if (smartAlertData.alert?.patternType === 'frequent_migraine') {
                    setActiveTrackTab('conditions');
                  } else {
                    setActiveTrackTab('symptoms');
                  }
                }}
                className="py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Review Logged Symptoms</span>
              </button>
              <button
                onClick={() => resetSmartAlertThrottles()}
                className="py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
              >
                Reset Alert Popup
              </button>
            </div>
          </div>
        )}

        {smartAlertData?.status === 'normal' && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Normal Baseline Pattern</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No concerning pain escalations, persistent symptoms, or emergency warning signs detected across your saved records ({smartAlertData.totalLogsEvaluated} total records analyzed).
            </p>
          </div>
        )}

        {(!smartAlertData || smartAlertData?.status === 'insufficient_data') && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-xs">
              <Activity className="w-4 h-4 shrink-0 text-pink-500" />
              <span>Calibrating Personal Baseline</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              Smart Health Alerts requires at least 3 saved symptom logs or 2 migraine logs to reliably identify trends and avoid generating false alerts.
            </p>
          </div>
        )}

        {/* Clinical Disclaimer */}
        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium text-center leading-normal pt-1">
          {smartAlertData?.clinicalDisclaimer || "Non-diagnostic pattern observation based on user-logged records. Consult your clinician for medical evaluation."}
        </p>
      </div>

    </div>
  );
};
