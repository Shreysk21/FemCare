import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, AlertTriangle, TrendingUp, BarChart2, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { UNUSUAL_PATTERN_ALERT } from '../data/mockData';

export const InsightsView = () => {
  const { insights, cycles, hydration, sleepLogs, moodLogs, completeTask } = useApp();

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Insights & Analytics</span>
          <span className="text-xl">📈</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Explainable, data-driven personal wellness patterns
        </p>
      </div>

      {/* ABNORMAL PATTERN DETECTION CARD (Non-diagnostic HCI Requirement) */}
      <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-5 rounded-3xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{UNUSUAL_PATTERN_ALERT.title}</span>
        </div>
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          {UNUSUAL_PATTERN_ALERT.message}
        </p>
        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
          <span>{UNUSUAL_PATTERN_ALERT.disclaimer}</span>
        </div>
      </div>

      {/* DAILY WELLNESS SUMMARY (Non-medical self-tracking summary) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daily Wellness Summary
          </h3>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Self-Tracking Summary</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
            <span className="text-slate-500 font-medium">💧 Hydration</span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">75% Achieved</div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40">
            <span className="text-slate-500 font-medium">😴 Sleep</span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">7h 20m (Good)</div>
          </div>
          <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40">
            <span className="text-slate-500 font-medium">😊 Mood</span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">Good (Energetic)</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-slate-500 font-medium">🩸 Cycle</span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">Day 14 (Follicular)</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-pink-50/80 dark:bg-pink-950/60 border border-pink-200/60 text-center text-xs font-bold text-pink-700 dark:text-pink-300">
          You're doing well today 🌸
        </div>
      </div>

      {/* PERSONALIZED WELLNESS INSIGHT CARDS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Personalized Wellness Insights
        </h3>

        {insights.map((ins) => (
          <div
            key={ins.id}
            onClick={() => completeTask(10)} // Task 10 completed!
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 cursor-pointer hover:border-pink-300 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <span className="text-xl">{ins.icon}</span>
                <span>{ins.title}</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {ins.category}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              "{ins.summary}"
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-pink-600 dark:text-pink-400 font-bold">
              <span>{ins.detail}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
