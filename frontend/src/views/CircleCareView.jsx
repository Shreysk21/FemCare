import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake, Shield, UserPlus, Eye, Coffee, Heart, UtensilsCrossed,
  Trash2, Sparkles, Send, Lock, CheckCircle2, Clock, AlertCircle,
  RefreshCw, Check
} from 'lucide-react';
import { CircleCareInviteModal } from '../components/CircleCareInviteModal';

export const CircleCareView = () => {
  const {
    circleMembers,
    setCircleInviteModalOpen,
    deleteCircleMember,
    revokeCircleShare,
    sharedWithMe,
    sharedWithMeLoading,
    fetchSharedWithMe,
    sendPartnerCareGesture,
    privacyShield
  } = useApp();

  const [subTab, setSubTab] = useState('members'); // 'members', 'sharedWithMe', or 'preview'
  const [gestureSent, setGestureSent] = useState(null);

  const activePartner = circleMembers.find(m => m.role === 'Partner') || circleMembers[0];

  const handleSendGesture = (gestureText, recipientName = "Partner") => {
    setGestureSent(gestureText);
    sendPartnerCareGesture(gestureText, recipientName);
    setTimeout(() => setGestureSent(null), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-xl mx-auto px-4 pt-4 pb-24 text-[var(--text-primary)]">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
            <span>Circle Care & Partner Sync</span>
            <span className="text-xl">🤝</span>
          </h2>
          <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
            Verified email-based sharing, empathetic support & granular privacy controls
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-[var(--bg-surface-elevated)] p-1 rounded-2xl flex border border-[var(--border-subtle)] gap-1">
        <button
          onClick={() => setSubTab('members')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'members'
              ? 'bg-[var(--bg-surface)] text-pink-600 dark:text-pink-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>My Shares ({circleMembers.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('sharedWithMe');
            fetchSharedWithMe();
          }}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'sharedWithMe'
              ? 'bg-[var(--bg-surface)] text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Shared With Me ({sharedWithMe.length})</span>
        </button>

        <button
          onClick={() => setSubTab('preview')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'preview'
              ? 'bg-[var(--bg-surface)] text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Partner Preview</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MY SHARES (INVITED PARTNERS / FAMILY MEMBERS)                  */}
      {/* ========================================================================= */}
      {subTab === 'members' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span>Sent Sharing Requests</span>
            <button
              onClick={() => setCircleInviteModalOpen(true)}
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Share With Partner</span>
            </button>
          </div>

          {circleMembers.length === 0 ? (
            <div className="p-8 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] space-y-3">
              <HeartHandshake className="w-10 h-10 text-pink-500 mx-auto" />
              <div className="font-extrabold text-sm">No Active Sharing Connections</div>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Invite your partner or sister by their registered FemCare email to securely share cycle phase & comfort needs.
              </p>
              <button
                onClick={() => setCircleInviteModalOpen(true)}
                className="px-5 py-2.5 bg-pink-600 text-white font-extrabold rounded-xl text-xs cursor-pointer"
              >
                Share Data With Email Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {circleMembers.map((member) => {
                const isAccepted = member.status === 'accepted' || member.status === 'Connected & Syncing';
                const isPending = member.status === 'pending';
                const isRevoked = member.status === 'revoked';
                const isDeclined = member.status === 'declined';

                return (
                  <div
                    key={member.id}
                    className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-2xl border border-pink-300">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-black text-sm text-[var(--text-primary)] flex items-center gap-2">
                            <span className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>
                              {member.name}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300">
                              {member.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] font-semibold mt-0.5">
                            {member.email} • Code: <strong className="font-mono text-pink-600 dark:text-pink-400">{member.syncCode}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isAccepted && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active & Syncing
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Partner Approval
                          </span>
                        )}
                        {isRevoked && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Access Revoked
                          </span>
                        )}
                        {isDeclined && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            ✕ Declined
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active Shared Permissions Badges */}
                    <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                      <div className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span>Granted Permissions:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        {member.permissions.phaseAndWindow && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300">
                            ✓ Cycle Phase & Window
                          </span>
                        )}
                        {member.permissions.emotionalState && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border border-teal-300">
                            ✓ Mood & Comfort Needs
                          </span>
                        )}
                        {member.permissions.specificSymptoms && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300">
                            ✓ Symptoms Logged
                          </span>
                        )}
                        {member.permissions.privateNotes ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300">
                            ✓ Private Notes Allowed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            🔒 Private Journal Notes Redacted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Member Controls: Revoke Access & Remove */}
                    <div className="pt-2 flex items-center justify-between">
                      {(isAccepted || isPending) ? (
                        <button
                          onClick={() => revokeCircleShare(member.id)}
                          className="py-1 px-3 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Revoke Access</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--text-secondary)] italic">
                          {isRevoked ? "Access revoked (Data shielded)" : "Request closed"}
                        </span>
                      )}

                      <button
                        onClick={() => deleteCircleMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete sharing connection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SHARED WITH ME (DATA SHARED BY SISTERHOOD / PARTNER)            */}
      {/* ========================================================================= */}
      {subTab === 'sharedWithMe' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span>Health Insights Shared With You</span>
            <button
              onClick={() => fetchSharedWithMe()}
              disabled={sharedWithMeLoading}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-pink-600 transition-colors cursor-pointer"
              title="Refresh shared data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sharedWithMeLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {sharedWithMe.length === 0 ? (
            <div className="p-8 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] space-y-3">
              <Shield className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-extrabold text-sm">No Health Data Shared With You Yet</div>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                When a partner or sister accepts your request or shares their cycle updates, their authorized menstrual phase, comfort needs, and empathetic prompts will appear right here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedWithMe.map((item) => (
                <div
                  key={item.shareId}
                  className="bg-[var(--bg-surface)] p-5 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-4"
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-xl">
                        🌸
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[var(--text-primary)]">
                          {item.senderName}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-medium">
                          {item.role} • {item.senderEmail}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300">
                      Live Authorized Sync
                    </span>
                  </div>

                  {/* 1. Cycle Phase & Window (if authorized) */}
                  {item.currentPhase && item.permissions.phaseAndWindow && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 text-white space-y-1.5 shadow-md">
                      <div className="flex justify-between items-center text-xs font-bold text-pink-100">
                        <span>{item.currentPhase.phaseBadge}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                          Day {item.currentPhase.cycleDay} of {item.currentPhase.totalDays}
                        </span>
                      </div>
                      <h4 className="text-base font-black">
                        {item.senderName} is in her {item.currentPhase.phaseName}
                      </h4>
                      <p className="text-xs text-pink-100 font-medium leading-relaxed">
                        {item.currentPhase.phaseDescription}
                      </p>
                      {item.currentPhase.nextPeriodWindow && (
                        <div className="text-[11px] font-bold text-pink-200 pt-1 border-t border-white/20">
                          Next expected period window: {item.currentPhase.nextPeriodWindow}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Emotional State / Mood (if authorized) */}
                  {item.emotionalState && item.permissions.emotionalState && (
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                      <div className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">
                        Logged Emotional State Today:
                      </div>
                      <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--text-primary)]">
                        <span className="text-xl">{item.emotionalState.emoji}</span>
                        <span>{item.emotionalState.label}</span>
                      </div>
                      {item.emotionalState.note && (
                        <p className="text-xs text-[var(--text-secondary)] italic mt-1 bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                          "{item.emotionalState.note}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Symptoms (if authorized) */}
                  {item.recentSymptoms && item.permissions.specificSymptoms && item.recentSymptoms.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
                      <div className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">
                        Logged Symptoms (Recent):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.recentSymptoms.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                          >
                            {s.symptomName} • <span className="text-pink-600">{s.severity}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Empathetic Action Recommendations */}
                  {item.recommendedPartnerActions && item.recommendedPartnerActions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Recommended Empathetic Actions Today:</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {item.recommendedPartnerActions.map((act, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-amber-950 dark:text-amber-100"
                          >
                            <span className="text-lg shrink-0">{act.icon}</span>
                            <div>
                              <div className="font-extrabold">{act.title}</div>
                              <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium mt-0.5">
                                {act.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Send Quick Support Gesture Back */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">
                        Send Quick Support Gesture Back:
                      </span>
                      {gestureSent && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full animate-bounce">
                          Sent ✓
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => handleSendGesture('Sent a warm cup of tea 🫖', item.senderName)}
                        className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-pink-500 font-bold transition-all text-center cursor-pointer"
                      >
                        <div className="text-xl mb-0.5">🫖</div>
                        <div className="text-[10px]">Warm Tea</div>
                      </button>

                      <button
                        onClick={() => handleSendGesture('Sent gentle hug 🌸', item.senderName)}
                        className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-pink-500 font-bold transition-all text-center cursor-pointer"
                      >
                        <div className="text-xl mb-0.5">🌸</div>
                        <div className="text-[10px]">Gentle Hug</div>
                      </button>

                      <button
                        onClick={() => handleSendGesture('Covering dinner tonight 🍲', item.senderName)}
                        className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-pink-500 font-bold transition-all text-center cursor-pointer"
                      >
                        <div className="text-xl mb-0.5">🍲</div>
                        <div className="text-[10px]">Dinner Ready</div>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PARTNER SCREEN PREVIEW MODE                                     */}
      {/* ========================================================================= */}
      {subTab === 'preview' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="bg-purple-900 text-white p-3.5 rounded-2xl border border-purple-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-300 animate-pulse" />
              <div>
                <div className="text-xs font-extrabold">Partner Screen Preview Mode</div>
                <div className="text-[10px] text-purple-200">
                  This preview illustrates what your partner sees once they accept your invitation
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-purple-800 px-2 py-0.5 rounded-full border border-purple-600">
              Simulation
            </span>
          </div>

          <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 text-white p-5 rounded-3xl shadow-lg space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-pink-100">
              <span>💖 Connected Partner Digest</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px]">Today</span>
            </div>
            <h3 className="text-base font-extrabold">
              Cycle Status: Late Luteal Phase (Day 26) 🌙
            </h3>
            <p className="text-xs text-pink-100 opacity-95 font-medium leading-relaxed">
              Energy is lower today. Emotional state logged: <strong>Rest & Comfort Preferred</strong>.
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
            <div className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recommended Empathetic Partner Actions Today</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5 text-amber-950 dark:text-amber-100">
                <Coffee className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div>Bring a warm drink or heat pad without being asked 🫖</div>
                  <div className="text-[10px] text-amber-800 dark:text-amber-300 font-medium mt-0.5">
                    Warm chamomile or peppermint tea helps soothe uterine muscle tension.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-start gap-2.5 text-purple-950 dark:text-purple-100">
                <Heart className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div>Prioritize calming activities & extra rest 🛋️</div>
                  <div className="text-[10px] text-purple-800 dark:text-purple-300 font-medium mt-0.5">
                    Progesterone drops during late luteal phase naturally increase fatigue.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Circle Care Invite Modal */}
      <CircleCareInviteModal />

    </div>
  );
};
