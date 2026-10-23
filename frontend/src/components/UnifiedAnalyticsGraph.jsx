import React, { useState, useMemo } from 'react';
import { Filter, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UnifiedAnalyticsGraph = () => {
  const {
    showToast,
    privacyShield,
    cycles,
    symptomLogs,
    moodLogs,
    sleepLogs,
    hydration,
    activityLogs,
    phaseLogs,
    setCurrentView
  } = useApp();

  // Dynamically derive timelineData from actual user database records
  const timelineData = useMemo(() => {
    const dateSet = new Set();
    (cycles || []).forEach(c => {
      if (c.startDate) dateSet.add(c.startDate);
      (c.flowLogs || []).forEach(f => {
        if (f.date) dateSet.add(f.date);
      });
    });
    (symptomLogs || []).forEach(s => { if (s.date) dateSet.add(s.date); });
    (moodLogs || []).forEach(m => { if (m.date) dateSet.add(m.date); });
    (sleepLogs || []).forEach(sl => { if (sl.date) dateSet.add(sl.date); });
    (activityLogs || []).forEach(a => { if (a.date) dateSet.add(a.date); });
    Object.keys(phaseLogs || {}).forEach(d => dateSet.add(d));

    const sortedDates = Array.from(dateSet).sort();
    if (sortedDates.length === 0) return [];

    return sortedDates.map(dateStr => {
      // 1. Period flow score (0-100)
      let periodScore = 0;
      let flowLabel = null;
      for (const c of (cycles || [])) {
        const fl = c.flowLogs?.find(f => f.date === dateStr);
        if (fl) {
          flowLabel = fl.flow;
          break;
        }
      }
      if (phaseLogs?.[dateStr]?.flow) flowLabel = phaseLogs[dateStr].flow;
      if (flowLabel === 'Heavy') periodScore = 100;
      else if (flowLabel === 'Medium') periodScore = 70;
      else if (flowLabel === 'Light') periodScore = 40;
      else if (flowLabel === 'Spotting') periodScore = 20;

      // 2. Symptom severity score (0-100)
      const daySymptoms = (symptomLogs || []).filter(s => s.date === dateStr);
      let symptomScore = 0;
      if (daySymptoms.length > 0) {
        const sevMap = { Severe: 100, Moderate: 65, Mild: 30 };
        const sum = daySymptoms.reduce((acc, s) => acc + (sevMap[s.severity] || 50), 0);
        symptomScore = Math.round(sum / daySymptoms.length);
      }

      // 3. Mood score (0-100)
      const dayMood = (moodLogs || []).find(m => m.date === dateStr);
      let moodScore = 60;
      if (dayMood) {
        const moodMap = { great: 95, good: 80, calm: 75, normal: 65, okay: 55, low: 35, irritated: 25, stressed: 20 };
        moodScore = moodMap[dayMood.moodId] || 60;
      }

      // 4. Sleep score (0-100)
      const daySleep = (sleepLogs || []).find(s => s.date === dateStr);
      let sleepScore = 65;
      if (daySleep) {
        const totalHrs = (daySleep.hours || 7) + (daySleep.minutes || 0) / 60;
        sleepScore = Math.min(Math.round((totalHrs / 8) * 100), 100);
      }

      // 5. Hydration target score (0-100)
      let waterScore = 70;
      if (hydration && hydration.date === dateStr && hydration.goalMl) {
        waterScore = Math.min(Math.round((hydration.currentMl / hydration.goalMl) * 100), 100);
      }

      // 6. Steps score (0-100)
      const dayAct = (activityLogs || []).find(a => a.date === dateStr);
      let stepsScore = 50;
      if (dayAct && dayAct.stepGoal) {
        stepsScore = Math.min(Math.round((dayAct.steps / dayAct.stepGoal) * 100), 100);
      }

      // 7. Wellness score
      const wellnessScore = Math.round((moodScore * 0.35) + (sleepScore * 0.35) + (waterScore * 0.15) + (Math.max(0, 100 - symptomScore) * 0.15));

      // Phase label
      const phaseInfo = phaseLogs?.[dateStr]?.phase || (flowLabel ? 'menstrual' : 'follicular');
      const phaseLabel = phaseInfo === 'menstrual' ? 'Menstrual Phase 🩸'
        : phaseInfo === 'follicular' ? 'Follicular Phase 🌱'
        : phaseInfo === 'ovulation' ? 'Ovulatory Phase 🌸'
        : 'Luteal Phase 🌙';

      const dObj = new Date(dateStr + 'T00:00:00');
      const dayDisplay = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const notesArr = [];
      if (flowLabel) notesArr.push(`${flowLabel} flow`);
      if (daySymptoms.length > 0) notesArr.push(daySymptoms.map(s => s.symptomName).join(', '));
      if (dayMood) notesArr.push(`Mood: ${dayMood.label || dayMood.moodId}`);

      return {
        dateStr,
        day: dayDisplay,
        phase: phaseLabel,
        wellnessScore,
        period: periodScore,
        mood: moodScore,
        symptom: symptomScore,
        sleep: sleepScore,
        water: waterScore,
        steps: stepsScore,
        note: notesArr.length > 0 ? notesArr.join('. ') : 'Recorded daily health entry.'
      };
    });
  }, [cycles, symptomLogs, moodLogs, sleepLogs, hydration, activityLogs, phaseLogs]);

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
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => Math.max(0, timelineData.length - 1));

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
    if (timelineData.length === 0) return "";
    if (timelineData.length === 1) {
      const yValue = timelineData[0][key];
      const y = paddingY + chartHeight - (yValue / 100) * chartHeight;
      return `${paddingX},${y} ${svgWidth - paddingX},${y}`;
    }
    return timelineData.map((d, index) => {
      const x = paddingX + (index / (timelineData.length - 1)) * chartWidth;
      const yValue = d[key];
      const y = paddingY + chartHeight - (yValue / 100) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  const safeIndex = Math.min(selectedDayIndex, Math.max(0, timelineData.length - 1));
  const selectedDay = timelineData[safeIndex];

  if (timelineData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm text-center space-y-3">
        <div className="text-3xl">📊</div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
          No Health Trends Recorded Yet
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          As you log your daily menstrual flow, symptoms, mood, sleep, and hydration, your personalized comparative trend graph and wellness timeline will appear here.
        </p>
        <button
          onClick={() => setCurrentView('track')}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>+ Log Today's Health Entry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

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
