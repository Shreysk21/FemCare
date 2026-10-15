import React, { useState } from 'react';
import { Filter, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UnifiedAnalyticsGraph = () => {
  const { showToast, privacyShield } = useApp();

  // 14-day sample dataset mapping normalized values (0 to 100 scale)
  const timelineData = [
    { day: "Sep 17", phase: "Menstrual Phase 🩸", wellnessScore: 55, period: 90, mood: 40, symptom: 80, sleep: 60, water: 60, steps: 40, note: "Heavy flow, mild abdominal cramps." },
    { day: "Sep 18", phase: "Menstrual Phase 🩸", wellnessScore: 62, period: 80, mood: 50, symptom: 70, sleep: 65, water: 70, steps: 45, note: "Medium flow, warm compress helped." },
    { day: "Sep 19", phase: "Menstrual Phase 🩸", wellnessScore: 70, period: 60, mood: 60, symptom: 50, sleep: 70, water: 80, steps: 55, note: "Flow easing down, fatigue improving." },
    { day: "Sep 20", phase: "Menstrual Phase 🩸", wellnessScore: 78, period: 40, mood: 70, symptom: 30, sleep: 75, water: 85, steps: 60, note: "Light flow, stayed well hydrated." },
    { day: "Sep 21", phase: "Menstrual Phase 🩸", wellnessScore: 85, period: 20, mood: 80, symptom: 20, sleep: 80, water: 90, steps: 70, note: "Period ending, feeling energetic." },
    { day: "Sep 22", phase: "Follicular Phase 🌱", wellnessScore: 88, period: 0, mood: 80, symptom: 10, sleep: 75, water: 80, steps: 75, note: "Energy high, clear skin." },
    { day: "Sep 23", phase: "Follicular Phase 🌱", wellnessScore: 92, period: 0, mood: 90, symptom: 10, sleep: 80, water: 95, steps: 80, note: "Great mood & motivation!" },
    { day: "Sep 24", phase: "Follicular Phase 🌱", wellnessScore: 95, period: 0, mood: 90, symptom: 0, sleep: 85, water: 90, steps: 85, note: "Peak vitality, morning workout." },
    { day: "Sep 25", phase: "Follicular Phase 🌱", wellnessScore: 88, period: 0, mood: 80, symptom: 10, sleep: 75, water: 80, steps: 75, note: "Steady focus throughout day." },
    { day: "Sep 26", phase: "Ovulatory Phase 🌸", wellnessScore: 84, period: 0, mood: 70, symptom: 20, sleep: 70, water: 75, steps: 65, note: "Egg-white mucus observed." },
    { day: "Sep 27", phase: "Ovulatory Phase 🌸", wellnessScore: 82, period: 0, mood: 70, symptom: 30, sleep: 70, water: 80, steps: 60, note: "Slight ovulation twinges." },
    { day: "Sep 28", phase: "Luteal Phase 🌙", wellnessScore: 86, period: 0, mood: 80, symptom: 20, sleep: 80, water: 85, steps: 68, note: "Calm evening, restful sleep." },
    { day: "Sep 29", phase: "Luteal Phase 🌙", wellnessScore: 72, period: 0, mood: 60, symptom: 40, sleep: 68, water: 70, steps: 68, note: "Mild bloating in evening." },
    { day: "Sep 30", phase: "Luteal Phase 🌙", wellnessScore: 78, period: 20, mood: 80, symptom: 50, sleep: 73, water: 80, steps: 54, note: "Pre-period spotting, relaxed pace." }
  ];

  // Parameters Config
  const parametersConfig = [
    { key: "period", label: "Period Flow", color: "#ec4899", icon: "🩸" },
    { key: "symptom", label: "Cramps / Symptoms", color: "#a855f7", icon: "🩺" },
    { key: "mood", label: "Mood Level", color: "#f59e0b", icon: "😊" },
    { key: "sleep", label: "Sleep Hours", color: "#0284c7", icon: "😴" },
    { key: "water", label: "Hydration Target", color: "#14b8a6", icon: "💧" },
    { key: "steps", label: "Activity Steps", color: "#10b981", icon: "🚶" }
  ];

  // Shneiderman's Mantra: Strict Cap of AT MOST 2 Active Compare Metrics
  const [selectedMetrics, setSelectedMetrics] = useState(["symptom", "water"]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(13); // Sep 30 selected by default

  const toggleMetric = (key) => {
    if (selectedMetrics.includes(key)) {
      if (selectedMetrics.length === 1) {
        showToast("Select at least 1 metric to display graph trends", null, "⚠️");
        return;
      }
      setSelectedMetrics(prev => prev.filter(k => k !== key));
    } else {
      if (selectedMetrics.length >= 2) {
        showToast("Compare AT MOST 2 metrics simultaneously to prevent visual clutter!", null, "⚠️");
        return;
      }
      setSelectedMetrics(prev => [...prev, key]);
    }
  };

  // SVG dimensions
  const svgWidth = 540;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Convert timeline data points to SVG coordinates
  const getCoordinates = (key) => {
    return timelineData.map((d, index) => {
      const x = paddingX + (index / (timelineData.length - 1)) * chartWidth;
      const yValue = d[key];
      const y = paddingY + chartHeight - (yValue / 100) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  const selectedDay = timelineData[selectedDayIndex];

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Multi-Parameter Health Analytics</span>
          </h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            Compare trends across cycle phases, symptoms, mood, sleep & hydration
          </p>
        </div>
      </div>

      {/* 1. OVERVIEW: DUAL-TONE HEAT-STRIP CYCLE TIMELINE */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <span>1. Overview Timeline: Phase vs. Wellness Score</span>
          <span className="text-pink-600 dark:text-pink-400 font-bold">14-Day Cycle Strip</span>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {timelineData.map((d, idx) => {
            const isMenstrual = d.phase.includes('Menstrual');
            const isFollicular = d.phase.includes('Follicular');
            const isOvulatory = d.phase.includes('Ovulatory');
            const isSelected = selectedDayIndex === idx;

            const bgClass = isMenstrual
              ? 'bg-rose-600 text-white font-bold'
              : isFollicular
              ? 'bg-amber-400 text-slate-950 font-bold'
              : isOvulatory
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-teal-600 text-white font-bold';

            return (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-1 min-w-[34px] py-2 px-1 rounded-xl text-center transition-all ${bgClass} ${
                  isSelected ? 'ring-4 ring-pink-500 scale-105 shadow-md' : 'opacity-85 hover:opacity-100'
                }`}
                title={`${d.day}: Wellness Score ${d.wellnessScore}% (${d.phase})`}
              >
                <div className="text-[9px] font-extrabold">{d.day.split(' ')[1]}</div>
                <div className="text-[10px] font-mono font-black mt-0.5">{d.wellnessScore}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FILTER: ACTIVE PILL CHIPS (CAPPED AT 2 METRICS) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 dark:text-slate-100">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span>2. Zoom & Filter (Select 2 Metrics to Compare)</span>
          </span>
          <span className="text-xs font-mono text-pink-700 dark:text-pink-300 font-extrabold bg-pink-100 dark:bg-pink-950 px-2.5 py-0.5 rounded-full border border-pink-300 dark:border-pink-800">
            {selectedMetrics.length} / 2 Max
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {parametersConfig.map((p) => {
            const isSelected = selectedMetrics.includes(p.key);
            return (
              <button
                key={p.key}
                onClick={() => toggleMetric(p.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-pink-500 shadow-md ring-2 ring-pink-400/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.icon} {p.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0 stroke-[3px]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPARISON TREND LINE GRAPH (HIGH CONTRAST SVG LABELS) */}
      <div className="relative bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-56 font-sans">
          
          {/* Y-Axis Grid Lines with High-Contrast Text */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingY + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  className="dark:stroke-slate-700"
                />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#334155" fontWeight="700" className="dark:fill-slate-300">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Selected Day Guideline */}
          {selectedDayIndex !== null && (
            <line
              x1={paddingX + (selectedDayIndex / (timelineData.length - 1)) * chartWidth}
              y1={paddingY}
              x2={paddingX + (selectedDayIndex / (timelineData.length - 1)) * chartWidth}
              y2={paddingY + chartHeight}
              stroke="#ec4899"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Render Only Selected Lines */}
          {selectedMetrics.map((key) => {
            const p = parametersConfig.find(param => param.key === key);
            if (!p) return null;
            return (
              <polyline
                key={p.key}
                fill="none"
                stroke={p.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getCoordinates(p.key)}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Day X-Axis Labels */}
          {timelineData.map((d, index) => {
            const x = paddingX + (index / (timelineData.length - 1)) * chartWidth;
            const isSelected = selectedDayIndex === index;

            return (
              <g key={index} className="cursor-pointer" onClick={() => setSelectedDayIndex(index)}>
                <circle cx={x} cy={paddingY + chartHeight / 2} r="14" fill="transparent" />
                <text
                  x={x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight={isSelected ? "900" : "700"}
                  fill={isSelected ? "#db2777" : "#475569"}
                  className={isSelected ? "dark:fill-pink-400" : "dark:fill-slate-300"}
                >
                  {d.day.split(' ')[1]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. DETAILS-ON-DEMAND: HIGH-CONTRAST SELECTED DAY SUMMARY CARD */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        
        {/* Header with High-Contrast Rose Berry Pill (WCAG AA Compliance) */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              3. Day Details: <strong className="text-pink-700 dark:text-pink-300">{selectedDay.day}, 2026</strong>
            </span>
          </div>
          <span className="text-xs font-black text-rose-950 dark:text-rose-100 bg-rose-100 dark:bg-rose-900 px-3 py-1 rounded-full border border-rose-300 dark:border-rose-700 shadow-2xs">
            {selectedDay.phase}
          </span>
        </div>

        {/* Selected Metrics Values Comparison - High Contrast Slate 900 Text */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {selectedMetrics.map((key) => {
            const p = parametersConfig.find(param => param.key === key);
            const val = selectedDay[key];
            return (
              <div key={key} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wide">
                    {p.label}
                  </div>
                  <div className={`text-base font-black text-slate-900 dark:text-slate-50 mt-0.5 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>
                    {val}% Score
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contextual Note */}
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="text-base">📝</span>
          <span className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>
            <strong className="text-slate-900 dark:text-slate-100 font-extrabold">Note:</strong> "{selectedDay.note}"
          </span>
        </div>
      </div>

    </div>
  );
};
