import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { HeartHandshake, Shield, Check, Copy, UserPlus, Key, Mail, Sparkles } from 'lucide-react';

export const CircleCareInviteModal = () => {
  const {
    circleInviteModalOpen,
    setCircleInviteModalOpen,
    addCircleMember,
    showToast
  } = useApp();

  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('Partner');
  const [syncCode, setSyncCode] = useState('FEM-8492');

  // Granular Privacy Permissions
  const [permissions, setPermissions] = useState({
    phaseAndWindow: true,
    emotionalState: true,
    specificSymptoms: false,
    privateNotes: false
  });

  if (!circleInviteModalOpen) return null;

  const handleGenerateCode = () => {
    const newCode = `FEM-${Math.floor(1000 + Math.random() * 9000)}`;
    setSyncCode(newCode);
    showToast(`New Sync Code generated: ${newCode} 🔑`);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(syncCode);
    showToast(`Sync Code ${syncCode} copied to clipboard! 📋`);
  };

  const handleSaveInvite = () => {
    addCircleMember(memberName || `${selectedRole} Member`, selectedRole, memberEmail, permissions);
    setMemberName('');
    setMemberEmail('');
    setCircleInviteModalOpen(false);
  };

  return (
    <Modal
      isOpen={circleInviteModalOpen}
      onClose={() => setCircleInviteModalOpen(false)}
      title="Invite to Circle Care & Partner Sync"
    >
      <div className="space-y-4 text-xs text-[var(--text-primary)]">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-2xl border border-purple-700/60 shadow-md space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-pink-300">
            <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
            <span>Trusted Member & Partner Sync</span>
          </div>
          <h3 className="text-base font-extrabold">Connect Loved Ones for Empathetic Support</h3>
          <p className="text-[11px] text-purple-200 opacity-90 leading-tight">
            Share cycle phase context, comfort needs & empathetic prompts with full control over your privacy.
          </p>
        </div>

        {/* Member Role Chips */}
        <div className="space-y-1.5">
          <label className="font-extrabold text-xs text-[var(--text-primary)]">
            1. Select Member Relationship Role:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { role: 'Partner', icon: '💖' },
              { role: 'Friend', icon: '🌸' },
              { role: 'Parent', icon: '🏡' },
              { role: 'Caregiver', icon: '🤝' }
            ].map((r) => {
              const isSel = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    isSel
                      ? 'bg-pink-600 text-white border-pink-500 shadow-md ring-2 ring-pink-400/40 scale-102'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-pink-300'
                  }`}
                >
                  <div className="text-base mb-0.5">{r.icon}</div>
                  <div className="text-[10px]">{r.role}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name & Email Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-[var(--text-primary)] mb-1">Member Name</label>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-[var(--text-primary)] mb-1">Member Email</label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="partner@example.com"
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-xs"
            />
          </div>
        </div>

        {/* Sync Code Option */}
        <div className="bg-[var(--bg-surface-elevated)] p-3 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">Or Share 6-Digit Sync Code</div>
            <div className="text-lg font-mono font-black text-pink-600 dark:text-pink-400">{syncCode}</div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleGenerateCode}
              className="p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-slate-100 font-bold text-[10px]"
              title="Generate new code"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 bg-pink-600 text-white rounded-xl font-extrabold text-[11px] hover:bg-pink-700 flex items-center gap-1 shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </button>
          </div>
        </div>

        {/* GRANULAR PRIVACY & PERMISSION CONTROLS */}
        <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-extrabold text-[var(--text-primary)]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Granular Privacy & Sharing Permissions</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
              User Agency Protected
            </span>
          </div>

          <div className="space-y-2">
            {[
              {
                key: 'phaseAndWindow',
                title: 'Current Cycle Phase & Next Period Window',
                subtitle: 'e.g. "Follicular Phase - Days 6–13"',
                defaultVal: true
              },
              {
                key: 'emotionalState',
                title: 'Emotional State & Comfort Needs',
                subtitle: 'e.g. "Feeling fatigued today, prefers low-key evening"',
                defaultVal: true
              },
              {
                key: 'specificSymptoms',
                title: 'Specific Symptoms & Flow Volume',
                subtitle: 'e.g. "Moderate abdominal cramps, heavy flow" (Off by default)',
                defaultVal: false
              },
              {
                key: 'privateNotes',
                title: 'Private Journal Notes & Log Entries',
                subtitle: 'e.g. "Personal diary notes" (Off by default)',
                defaultVal: false
              }
            ].map((item) => (
              <label
                key={item.key}
                className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start gap-3 cursor-pointer hover:border-pink-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={permissions[item.key]}
                  onChange={(e) => setPermissions(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="mt-1 w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
                <div>
                  <div className="font-extrabold text-xs text-[var(--text-primary)]">{item.title}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-medium">{item.subtitle}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSaveInvite}
          className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Save Permissions & Send Circle Invitation</span>
        </button>

      </div>
    </Modal>
  );
};
