import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UnifiedAnalyticsGraph } from '../components/UnifiedAnalyticsGraph';
import { PhaseEnergyCard } from '../components/PhaseEnergyCard';
import { BarChart2, TrendingUp, Calendar, Moon, Droplets, Footprints, AlertTriangle } from 'lucide-react';

export const AnalyticsView = () => {
  const { cycles, symptomLogs, moodLogs, sleepLogs, hydration, activityLogs, privacyShield } = useApp();

  const [activeMetricTab, setActiveMetricTab] = useState('summary'); // summary, cycle, symptoms, mood, sleep, water

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Health Insights & Analytics</span>
          <span className="text-xl">📊</span>
        </h2>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
          Multi-parameter health summary, cycle phase trends & daily energy insights
        </p>
      </div>

      {/* PHASE-BASED DAILY ENERGY INSIGHT CARD (Requirement 3B) */}
      <PhaseEnergyCard />

      {/* Metric Category Subtabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'summary', label: '📈 Summary Graph' },
          { id: 'cycle', label: '🌸 Cycle' },
          { id: 'symptoms', label: '🩺 Symptoms' },
          { id: 'mood', label: '😊 Mood' },
          { id: 'sleep', label: '😴 Sleep' },
          { id: 'water', label: '💧 Hydration' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMetricTab(tab.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              activeMetricTab === tab.id
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: UNIFIED SUMMARY LINE GRAPH */}
      {activeMetricTab === 'summary' && (
        <div className="space-y-4 animate-fade-in">
          <UnifiedAnalyticsGraph />
        </div>
      )}

      {/* TAB 2: CYCLE ANALYTICS */}
      {activeMetricTab === 'cycle' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span>Cycle Length History (Past 4 Months)</span>
            </h3>

            <div className="space-y-3 pt-2">
              {[
                { month: 'September 2026', length: 28, periodDays: 5, color: 'bg-pink-600' },
                { month: 'August 2026', length: 28, periodDays: 5, color: 'bg-rose-600' },
                { month: 'July 2026', length: 28, periodDays: 5, color: 'bg-purple-600' },
                { month: 'June 2026', length: 28, periodDays: 5, color: 'bg-teal-600' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{item.month}</span>
                    <span className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>{item.length} days ({item.periodDays} flow days)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${(item.length / 35) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 text-center space-y-0.5">
                <div className="text-[11px] font-extrabold uppercase text-pink-700 dark:text-pink-300">Average Cycle</div>
                <div className={`text-2xl font-black text-pink-950 dark:text-pink-100 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>28 Days</div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Variation: ±0.5 days</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-center space-y-0.5">
                <div className="text-[11px] font-extrabold uppercase text-teal-700 dark:text-teal-300">Avg Period Duration</div>
                <div className={`text-2xl font-black text-teal-950 dark:text-teal-100 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>5 Days</div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Regular Flow</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYMPTOM PATTERNS */}
      {activeMetricTab === 'symptoms' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Most Frequently Logged Symptoms
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Abdominal Cramps', count: 8, phase: 'Menstrual Phase (Days 1-3)', percent: 80, color: 'bg-rose-600' },
                { name: 'Bloating', count: 5, phase: 'Luteal Phase (Days 22-26)', percent: 50, color: 'bg-purple-600' },
                { name: 'Fatigue & Low Energy', count: 4, phase: 'Luteal / Menstrual', percent: 40, color: 'bg-amber-600' },
                { name: 'Headache', count: 2, phase: 'Day 1 of Cycle', percent: 20, color: 'bg-sky-600' }
              ].map((sym, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span>{sym.name}</span>
                    <span className="text-slate-700 dark:text-slate-300">{sym.count} entries ({sym.phase})</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${sym.color} h-full rounded-full`} style={{ width: `${sym.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MOOD TRENDS */}
      {activeMetricTab === 'mood' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Mood Trends Across Cycle Phases
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <div className="text-2xl mb-1">🙂 Good</div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100">Follicular Phase</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">Highest energy & positive mood logged during Days 6-13.</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900">
                <div className="text-2xl mb-1">😐 Calm / Okay</div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100">Luteal Phase</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-0.5">Desire for rest and quiet activities logged during Days 20-27.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SLEEP TRENDS */}
      {activeMetricTab === 'sleep' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-500" />
              <span>Weekly Sleep Duration & Quality</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { day: 'Wed (Today)', hours: '7h 20m', quality: 'Good' },
                { day: 'Tue', hours: '6h 45m', quality: 'Fair' },
                { day: 'Mon', hours: '8h 00m', quality: 'Excellent' },
                { day: 'Sun', hours: '7h 45m', quality: 'Good' }
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-semibold">
                  <span className="font-bold w-24 text-slate-900 dark:text-slate-100">{s.day}</span>
                  <span className={`font-bold text-slate-900 dark:text-slate-100 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>{s.hours}</span>
                  <span className="text-sky-700 dark:text-sky-300 font-extrabold">{s.quality}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
