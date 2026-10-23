import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap } from 'lucide-react';

export const PhaseEnergyCard = () => {
  const { homePhaseMode, privacyShield } = useApp();

  const isMenstrual = homePhaseMode === 'menstrual';

  const phaseDetails = isMenstrual
    ? {
        title: "Menstrual Phase: Rest & Restore 🩸",
        subtitle: "Estrogen & progesterone levels are low. Prioritize soothing care.",
        badge: "Low Energy Phase",
        badgeBg: "bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-100 border border-rose-300 dark:border-rose-700 font-extrabold",
        tips: [
          {
            icon: "🧘‍♀️",
            category: "Optimal Physical Activity",
            text: "Gentle restorative yoga, pelvic tilt stretches, low-impact walking, and ample rest."
          },
          {
            icon: "🥗",
            category: "Nutrient Guidance",
            text: "Iron-rich foods (spinach, lentils), magnesium for uterine muscle ease, and warm ginger tea."
          }
        ]
      }
    : {
        title: "Follicular & Ovulatory Phase: Natural Energy Peak 🌱",
        subtitle: "Rising estrogen boosts metabolism, stamina, and mental sharpness.",
        badge: "High Vitality Peak",
        badgeBg: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700 font-extrabold",
        tips: [
          {
            icon: "🏋️‍♀️",
            category: "Optimal Physical Activity",
            text: "Higher intensity strength training, HIIT, running, or dance cardio to match rising stamina."
          },
          {
            icon: "🥗",
            category: "Nutrient Guidance",
            text: "Fermented foods for gut health, fresh lean proteins, complex carbs, and electrolytic hydration."
          }
        ]
      };

  return (
    <div
      className="shadow-sm rounded-3xl p-5 space-y-3 relative overflow-hidden border transition-colors"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {phaseDetails.title}
          </h3>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${phaseDetails.badgeBg}`}>
          {phaseDetails.badge}
        </span>
      </div>

      <p className={`font-medium text-xs leading-relaxed ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`} style={{ color: 'var(--text-secondary)' }}>
        {phaseDetails.subtitle}
      </p>

      {/* Inner Sub-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {phaseDetails.tips.map((tip, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl border space-y-1.5 transition-colors"
            style={{ backgroundColor: 'var(--bg-subcard)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
              <span className="text-base">{tip.icon}</span>
              <span>{tip.category}</span>
            </div>
            <p className={`font-medium leading-relaxed text-xs sm:text-sm ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`} style={{ color: 'var(--text-secondary)' }}>
              {tip.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

