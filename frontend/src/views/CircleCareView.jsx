import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeartHandshake, Shield, UserPlus, Eye, Coffee, Heart, UtensilsCrossed, Trash2, Edit3, Check, Sparkles, Send } from 'lucide-react';
import { CircleCareInviteModal } from '../components/CircleCareInviteModal';

export const CircleCareView = () => {
  const {
    circleMembers,
    setCircleInviteModalOpen,
    deleteCircleMember,
    sendPartnerCareGesture,
    privacyShield
  } = useApp();

  const [subTab, setSubTab] = useState('members'); // 'members' or 'preview'
  const [gestureSent, setGestureSent] = useState(null);

  const activePartner = circleMembers.find(m => m.role === 'Partner') || circleMembers[0];

  const handleSendGesture = (gestureText) => {
    setGestureSent(gestureText);
    sendPartnerCareGesture(gestureText, activePartner ? `${activePartner.name} (${activePartner.role})` : "Partner");
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
            Share cycle phase context, comfort needs & empathetic prompts with loved ones
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-[var(--bg-surface-elevated)] p-1 rounded-2xl flex border border-[var(--border-subtle)]">
        <button
          onClick={() => setSubTab('members')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            subTab === 'members'
              ? 'bg-[var(--bg-surface)] text-pink-600 dark:text-pink-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>My Circle Members ({circleMembers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('preview')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            subTab === 'preview'
              ? 'bg-[var(--bg-surface)] text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Partner View Preview</span>
        </button>
      </div>

      {/* SUB-TAB 1: MY CONNECTED CIRCLE MEMBERS */}
      {subTab === 'members' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex justify-between items-center text-xs font-extrabold">
            <span>Connected Trusted Members</span>
            <button
              onClick={() => setCircleInviteModalOpen(true)}
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Member</span>
            </button>
          </div>

          {circleMembers.length === 0 ? (
            <div className="p-8 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] space-y-3">
              <HeartHandshake className="w-10 h-10 text-pink-500 mx-auto" />
              <div className="font-extrabold text-sm">No Circle Members Added Yet</div>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Invite your partner, parent, or close friend to sync cycle phase context & support needs with privacy controls.
              </p>
              <button
                onClick={() => setCircleInviteModalOpen(true)}
                className="px-5 py-2.5 bg-pink-600 text-white font-extrabold rounded-xl text-xs"
              >
                Invite Partner / Friend Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {circleMembers.map((member) => (
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
                          <span className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>{member.name}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300">
                            {member.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-semibold mt-0.5">
                          {member.email} • Code: <strong className="font-mono text-pink-600 dark:text-pink-400">{member.syncCode}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCircleMember(member.id)}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-800 rounded-full hover:bg-rose-50 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Active Privacy Sharing Badges */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span>Active Shared Permissions:</span>
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
                      {!member.permissions.specificSymptoms && !member.permissions.privateNotes && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          🔒 Journal Notes & Flow Redacted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: PARTNER VIEW PREVIEW (EMPATHY & ACTION CARDS) */}
      {subTab === 'preview' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Banner Notice */}
          <div className="bg-purple-900 text-white p-3.5 rounded-2xl border border-purple-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-300 animate-pulse" />
              <div>
                <div className="text-xs font-extrabold">Partner Screen Preview Mode</div>
                <div className="text-[10px] text-purple-200">This is exactly what {activePartner ? activePartner.name : 'your partner'} sees on their phone</div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-purple-800 px-2 py-0.5 rounded-full border border-purple-600">
              Live Sync
            </span>
          </div>

          {/* 1. Status Card for Partner */}
          <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 text-white p-5 rounded-3xl shadow-lg space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-pink-100">
              <span>💖 Connected Partner Digest</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px]">Today</span>
            </div>

            <h3 className="text-base font-extrabold">
              Shreya is in her Late Luteal Phase (Day 26) 🌙
            </h3>

            <p className="text-xs text-pink-100 opacity-95 font-medium leading-relaxed">
              Energy might be lower today. Emotional state logged: <strong>Rest & Comfort Preferred</strong>.
            </p>
          </div>

          {/* 2. Empathetic Action Prompts for the Partner */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3 shadow-xs">
            <div className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recommended Empathetic Partner Actions Today</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5 text-amber-950 dark:text-amber-100">
                <Coffee className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div>Bring a warm drink or heat pad without being asked 🫖</div>
                  <div className="text-[10px] text-amber-800 dark:text-amber-300 font-medium mt-0.5">Warm chamomile or peppermint tea helps soothe uterine muscle tension.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-start gap-2.5 text-purple-950 dark:text-purple-100">
                <Heart className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div>Prioritize calming activities & extra rest 🛋️</div>
                  <div className="text-[10px] text-purple-800 dark:text-purple-300 font-medium mt-0.5">Progesterone drops during late luteal phase increase fatigue.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2.5 text-teal-950 dark:text-teal-100">
                <UtensilsCrossed className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div>Avoid scheduling high-stress evening plans 🌙</div>
                  <div className="text-[10px] text-teal-800 dark:text-teal-300 font-medium mt-0.5">Offer to cover dinner or order comforting food.</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. "Send Care Gesture" Micro-Interactions */}
          <div className="bg-[var(--bg-surface-elevated)] p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                Send Support Care Gesture Back to Shreya:
              </span>
              {gestureSent && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full animate-bounce">
                  Sent ✓
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleSendGesture('Sent a warm cup of tea 🫖')}
                className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-pink-500 hover:scale-105 font-bold transition-all text-center shadow-2xs"
              >
                <div className="text-2xl mb-1">🫖</div>
                <div className="text-[11px] leading-tight">Warm Tea</div>
              </button>

              <button
                onClick={() => handleSendGesture('Sent gentle hug 🌸')}
                className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-pink-500 hover:scale-105 font-bold transition-all text-center shadow-2xs"
              >
                <div className="text-2xl mb-1">🌸</div>
                <div className="text-[11px] leading-tight">Gentle Hug</div>
              </button>

              <button
                onClick={() => handleSendGesture('Covering dinner tonight 🍲')}
                className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-pink-500 hover:scale-105 font-bold transition-all text-center shadow-2xs"
              >
                <div className="text-2xl mb-1">🍲</div>
                <div className="text-[11px] leading-tight">Dinner Handled</div>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Circle Care Invite Modal */}
      <CircleCareInviteModal />

    </div>
  );
};
