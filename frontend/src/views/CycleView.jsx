import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  Sparkles,
  Flame,
  Droplets,
  Moon,
  Info,
  CalendarDays,
  X,
  Smile,
  Activity,
  Heart,
  RotateCcw
} from 'lucide-react';
import { Modal } from '../components/Modal';

// Phase Definitions with Biological Context and Visual Badges
const PHASES = {
  menstrual: {
    id: 'menstrual',
    name: 'Menstrual Phase',
    shortName: 'Menstrual (Period)',
    icon: '🩸',
    pillBg: 'bg-rose-500 text-white',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800',
    dotColor: 'bg-rose-500',
    accentColor: '#e11d48',
    tagline: 'Rest, Warmth & Soothing Care (Days 1–5)',
    description: 'Estrogen and progesterone are at their baseline. The uterine lining is shedding. Prioritize warmth, gentle rest, hydration, and soothing care.'
  },
  follicular: {
    id: 'follicular',
    name: 'Follicular Phase',
    shortName: 'Follicular',
    icon: '🌱',
    pillBg: 'bg-teal-500 text-white',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-800',
    dotColor: 'bg-teal-500',
    accentColor: '#0d9488',
    tagline: 'Energy, Stamina & Mental Clarity (Days 6–11)',
    description: 'Follicle Stimulating Hormone (FSH) promotes egg maturation. Estrogen rises, boosting stamina, focus, and positive mood.'
  },
  ovulation: {
    id: 'ovulation',
    name: 'Ovulation & Fertile Phase',
    shortName: 'Ovulation',
    icon: '✨',
    pillBg: 'bg-purple-600 text-white',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800',
    dotColor: 'bg-purple-500',
    accentColor: '#9333ea',
    tagline: 'Peak Fertility Window & Vitality (Days 12–16)',
    description: 'Luteinizing Hormone (LH) surge triggers ovulation (Day 14). Estrogen peaks, bringing high confidence, vitality, and fertile cervical mucus.'
  },
  luteal: {
    id: 'luteal',
    name: 'Luteal Phase',
    shortName: 'Luteal',
    icon: '🌙',
    pillBg: 'bg-amber-500 text-white',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    accentColor: '#d97706',
    tagline: 'Progesterone Surge & Pre-Menstrual (Days 17–28)',
    description: 'Progesterone dominates to nurture the body. Basal body temperature slightly rises. Focus on magnesium-rich foods, calming routines, and PMS care.'
  }
};

const COMMON_SYMPTOMS = [
  { name: 'Abdominal Cramps', icon: '🩺', category: 'Pain' },
  { name: 'Headache', icon: '💆‍♀️', category: 'Pain' },
  { name: 'Bloating', icon: '💧', category: 'Digestive' },
  { name: 'Fatigue', icon: '🥱', category: 'Energy' },
  { name: 'Tender Breasts', icon: '🌸', category: 'Sensitivity' },
  { name: 'Acne Breakout', icon: '✨', category: 'Skin' },
  { name: 'Lower Back Pain', icon: '⚡', category: 'Pain' },
  { name: 'Food Cravings', icon: '🍫', category: 'Appetite' },
];

const MOOD_OPTIONS = [
  { id: 'happy', label: 'Energetic', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'okay', label: 'Normal', emoji: '🙂' },
  { id: 'sensitive', label: 'Sensitive', emoji: '🥺' },
  { id: 'low', label: 'Low', emoji: '😔' },
  { id: 'irritated', label: 'Irritated', emoji: '😣' },
];

export const CycleView = () => {
  const {
    user,
    cycles,
    phaseLogs,
    logPhaseForDate,
    deletePhaseForDate,
    deletePeriodEntry,
    privacyShield,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'history'
  
  // Displayed month (Defaults to October 2026)
  const [displayedMonthDate, setDisplayedMonthDate] = useState(new Date(2026, 9, 1));
  
  // Selected date on calendar (Defaults to 2026-10-12)
  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  
  // Modal State for logging phase
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('2026-10-12');
  const [selectedPhase, setSelectedPhase] = useState('menstrual');
  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [periodMarker, setPeriodMarker] = useState('ongoing'); // 'start', 'ongoing', 'end'
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState('');

  // Delete cycle confirmation modal
  const [deleteModalData, setDeleteModalData] = useState(null);

  // Biological Phase Calculation Helper for any given date
  const getDayPhaseInfo = useMemo(() => {
    return (dateStr) => {
      // 1. Explicit user-logged phase for this date
      if (phaseLogs && phaseLogs[dateStr]) {
        const log = phaseLogs[dateStr];
        const meta = PHASES[log.phase] || PHASES.menstrual;
        return {
          phase: log.phase,
          meta,
          flow: log.flow || (log.phase === 'menstrual' ? 'Medium' : null),
          mood: log.mood || null,
          symptoms: log.symptoms || [],
          notes: log.notes || '',
          isManual: true,
          isPeriod: log.phase === 'menstrual'
        };
      }

      // 2. Flow logs from cycles
      for (const cyc of (cycles || [])) {
        const flowMatch = cyc.flowLogs?.find(f => f.date === dateStr);
        if (flowMatch) {
          return {
            phase: 'menstrual',
            meta: PHASES.menstrual,
            flow: flowMatch.flow || 'Medium',
            isManual: true,
            isPeriod: true
          };
        }
      }

      // 3. Mathematical Cycle Projection
      const currentCycle = cycles?.[0];
      const refStartStr = currentCycle?.startDate || user?.lastPeriodStartDate || '2026-09-17';
      const cycleLength = currentCycle?.length || user?.avgCycleLength || 28;
      const periodDuration = currentCycle?.periodDuration || user?.avgPeriodDuration || 5;

      const [tY, tM, tD] = dateStr.split('-').map(Number);
      const [rY, rM, rD] = refStartStr.split('-').map(Number);
      const targetDate = new Date(tY, tM - 1, tD);
      const refDate = new Date(rY, rM - 1, rD);
      const diffDays = Math.round((targetDate - refDate) / (1000 * 60 * 60 * 24));

      // Positive modulo
      const cycleDay = (((diffDays % cycleLength) + cycleLength) % cycleLength) + 1;

      if (cycleDay <= periodDuration) {
        return {
          phase: 'menstrual',
          meta: PHASES.menstrual,
          flow: cycleDay <= 2 ? 'Heavy' : cycleDay === 3 ? 'Medium' : 'Light',
          cycleDay,
          isPredicted: true,
          isPeriod: true
        };
      } else if (cycleDay <= cycleLength - 17) {
        return {
          phase: 'follicular',
          meta: PHASES.follicular,
          cycleDay,
          isPredicted: true,
          isPeriod: false
        };
      } else if (cycleDay <= cycleLength - 12) {
        return {
          phase: 'ovulation',
          meta: PHASES.ovulation,
          isPeakOvulation: cycleDay === Math.round(cycleLength - 14),
          cycleDay,
          isPredicted: true,
          isPeriod: false
        };
      } else {
        return {
          phase: 'luteal',
          meta: PHASES.luteal,
          cycleDay,
          isPredicted: true,
          isPeriod: false
        };
      }
    };
  }, [cycles, phaseLogs, user]);

  // Calendar Grid Calculation for Displayed Month
  const currentYear = displayedMonthDate.getFullYear();
  const currentMonth = displayedMonthDate.getMonth(); // 0-indexed

  const monthName = displayedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // 1. Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        phaseInfo: getDayPhaseInfo(dateStr)
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        phaseInfo: getDayPhaseInfo(dateStr)
      });
    }

    // 3. Next month trailing padding days to complete standard 7-col weeks
    const totalCells = cells.length;
    const remainingDays = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        phaseInfo: getDayPhaseInfo(dateStr)
      });
    }

    return cells;
  }, [currentYear, currentMonth, getDayPhaseInfo]);

  // Calendar Navigation Handlers
  const handlePrevMonth = () => {
    setDisplayedMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayedMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date(2026, 9, 12); // Oct 12, 2026
    setDisplayedMonthDate(new Date(2026, 9, 1));
    setSelectedDate('2026-10-12');
  };

  // Click on date cell: Select date & open menstrual phase logging modal
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setModalDate(dateStr);

    const existingInfo = getDayPhaseInfo(dateStr);
    setSelectedPhase(existingInfo.phase || 'menstrual');
    setSelectedFlow(existingInfo.flow || 'Medium');
    setSelectedMood(existingInfo.mood || null);
    setSelectedSymptoms(existingInfo.symptoms || []);
    setNotes(existingInfo.notes || '');

    setPhaseModalOpen(true);
  };

  // Toggle symptom chip
  const toggleSymptomSelection = (symObj) => {
    setSelectedSymptoms(prev => {
      const exists = prev.some(s => s.name === symObj.name);
      if (exists) return prev.filter(s => s.name !== symObj.name);
      return [...prev, symObj];
    });
  };

  // Save Phase Log Handler
  const handleSavePhase = async () => {
    await logPhaseForDate(modalDate, {
      phase: selectedPhase,
      flow: selectedPhase === 'menstrual' ? selectedFlow : null,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      notes,
      isPeriodStart: selectedPhase === 'menstrual' && periodMarker === 'start'
    });
    setPhaseModalOpen(false);
  };

  // Clear / Delete manual log for date
  const handleClearLog = async () => {
    await deletePhaseForDate(modalDate);
    setPhaseModalOpen(false);
  };

  // Selected date info for inspector card
  const selectedDateInfo = getDayPhaseInfo(selectedDate);
  const formattedSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>Cycle & Period Calendar</span>
            <span className="text-xl">🩸</span>
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Click on any date to log or view your menstrual phase
          </p>
        </div>

        <button
          onClick={() => handleDateClick(selectedDate)}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Phase</span>
        </button>
      </div>

      {/* 2. Subnav Tabs */}
      <div className="flex p-1 rounded-2xl border transition-colors" style={{ backgroundColor: 'var(--bg-subcard)', borderColor: 'var(--border-card)' }}>
        {[
          { id: 'calendar', label: 'Calendar View', icon: CalendarIcon },
          { id: 'history', label: 'Cycle History', icon: CalendarDays }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'hover:opacity-100'
              }`}
              style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CALENDAR VIEW TAB */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Main Interactive Calendar Card */}
          <div
            className="rounded-3xl border shadow-sm p-4 sm:p-5 space-y-4 transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            
            {/* Calendar Month Header & Controls */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/70 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {monthName}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Standard monthly cycle projection
                  </p>
                </div>
              </div>

              {/* Month Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleGoToToday}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Jump to current date"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Usual Weekday Column Headers (Sun to Sat) */}
            <div className="grid grid-cols-7 text-center text-[11px] font-extrabold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Standard 7-Column Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarGrid.map((cell, idx) => {
                const { dayNumber, dateStr, isCurrentMonth, phaseInfo } = cell;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === '2026-10-12';
                const isMenstrual = phaseInfo.phase === 'menstrual';
                const isManual = phaseInfo.isManual;

                // Color coding based on phase
                let phaseStyle = '';
                let dotIcon = null;

                if (isMenstrual) {
                  if (isManual) {
                    phaseStyle = 'bg-rose-500 text-white font-black shadow-sm shadow-rose-500/30 ring-1 ring-rose-400';
                    dotIcon = '🩸';
                  } else {
                    // Predicted period flow
                    phaseStyle = 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-dashed border-rose-400 dark:border-rose-700 font-bold';
                    dotIcon = '🩸';
                  }
                } else if (phaseInfo.phase === 'ovulation') {
                  phaseStyle = 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800';
                  dotIcon = phaseInfo.isPeakOvulation ? '⭐' : '✨';
                } else if (phaseInfo.phase === 'follicular') {
                  phaseStyle = 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-900';
                  dotIcon = '🌱';
                } else if (phaseInfo.phase === 'luteal') {
                  phaseStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900';
                  dotIcon = '🌙';
                }

                return (
                  <button
                    key={`${dateStr}-${idx}`}
                    onClick={() => handleDateClick(dateStr)}
                    className={`relative min-h-[52px] sm:min-h-[58px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all duration-150 cursor-pointer ${
                      !isCurrentMonth ? 'opacity-35 hover:opacity-75' : ''
                    } ${
                      isSelected
                        ? 'ring-2 ring-rose-600 dark:ring-rose-400 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10 shadow-md'
                        : 'hover:scale-102 hover:shadow-xs'
                    } ${phaseStyle}`}
                    title={`${dateStr}: ${phaseInfo.meta?.name} ${isManual ? '(Logged)' : '(Predicted)'}`}
                    aria-label={`Select ${dateStr}, ${phaseInfo.meta?.name}`}
                  >
                    {/* Top Row: Day Number + Today Badge */}
                    <div className="w-full flex items-center justify-between px-1">
                      <span className={`text-xs font-black ${isMenstrual && isManual ? 'text-white' : ''}`}>
                        {dayNumber}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 ring-1 ring-white" title="Today" />
                      )}
                    </div>

                    {/* Middle Icon: Phase Symbol */}
                    <div className="text-[11px] leading-none my-0.5">
                      {dotIcon}
                    </div>

                    {/* Bottom Mini Flow/Phase Label */}
                    <div className="w-full text-center">
                      {isMenstrual ? (
                        <span className={`text-[8px] font-extrabold uppercase tracking-tight block truncate ${
                          isManual ? 'text-rose-100' : 'text-rose-700 dark:text-rose-300'
                        }`}>
                          {phaseInfo.flow || 'Period'}
                        </span>
                      ) : (
                        <span className="text-[8px] font-semibold opacity-75 block truncate">
                          {phaseInfo.meta?.shortName}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Helper Legend */}
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Period (Logged)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-rose-500 bg-rose-100 inline-block" />
                <span>Predicted Period</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                <span>Follicular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>Fertile Peak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Luteal</span>
              </div>
            </div>

          </div>

          {/* 4. SELECTED DATE INSPECTOR & LOG ACTION CARD */}
          <div
            className="rounded-3xl border p-5 shadow-sm space-y-3 relative overflow-hidden transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Selected Date Details
                </span>
                <h4 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {formattedSelectedDate}
                </h4>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${selectedDateInfo.meta.badgeBg}`}>
                <span>{selectedDateInfo.meta.icon}</span>
                <span>{selectedDateInfo.meta.name}</span>
                {selectedDateInfo.isManual && <span className="text-[9px] font-black uppercase ml-1">• Logged</span>}
              </span>
            </div>

            <p className={`text-xs leading-relaxed font-medium ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`} style={{ color: 'var(--text-secondary)' }}>
              {selectedDateInfo.meta.description}
            </p>

            {/* Details if logged */}
            {(selectedDateInfo.flow || selectedDateInfo.symptoms?.length > 0 || selectedDateInfo.mood) && (
              <div className="p-3 rounded-2xl border flex flex-wrap gap-2 text-xs" style={{ backgroundColor: 'var(--bg-subcard)', borderColor: 'var(--border-card)' }}>
                {selectedDateInfo.flow && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-bold">
                    🩸 Flow: {selectedDateInfo.flow}
                  </span>
                )}
                {selectedDateInfo.mood && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-bold">
                    {selectedDateInfo.mood.emoji} Mood: {selectedDateInfo.mood.label}
                  </span>
                )}
                {selectedDateInfo.symptoms?.map((sym, sIdx) => (
                  <span key={sIdx} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 font-bold">
                    🩺 {sym.name || sym}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Action Button for Selected Date */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleDateClick(selectedDate)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{selectedDateInfo.isManual ? 'Edit Phase / Flow for This Date' : 'Log Menstrual Phase for This Date'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {selectedDateInfo.isManual && (
                <button
                  onClick={() => handleClearLog()}
                  className="px-3 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold transition-colors cursor-pointer"
                  title="Clear manual log and reset to cycle prediction"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 5. CYCLE STATS & PREDICTION BANNER */}
          <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-teal-50 dark:from-pink-950/40 dark:via-slate-900 dark:to-teal-950/40 p-5 rounded-3xl border border-pink-200/80 dark:border-pink-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Next Predicted Period</span>
              </span>
              <span className={`text-xs font-extrabold text-pink-600 dark:text-pink-400 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>
                15 October 2026
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Based on your typical <strong>28-day cycle</strong> and <strong>5-day duration</strong>. Predictions adapt automatically as you log new cycle phases.
            </p>
          </div>

        </div>
      )}

      {/* 4. CYCLE HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Recorded Period History ({cycles.length} Cycles)
            </h3>
            <span className="text-xs text-slate-500">
              Avg Cycle: {user?.avgCycleLength || 28} days
            </span>
          </div>

          {cycles.map((cyc) => (
            <div
              key={cyc.id}
              className="p-4 rounded-2xl border shadow-xs space-y-3 transition-colors"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{cyc.startDate} — {cyc.endDate}</span>
                    {cyc.status === 'current' && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                        Active Cycle
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Length: <strong>{cyc.length} days</strong> • Period Duration: <strong>{cyc.periodDuration} days</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDeleteModalData({ cycleId: cyc.id, date: cyc.startDate })}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors cursor-pointer"
                    aria-label="Delete cycle entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mini Flow Logs for this Cycle */}
              {cyc.flowLogs && cyc.flowLogs.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {cyc.flowLogs.map((fl, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900"
                    >
                      {fl.date.split('-').slice(1).join('/')}: {fl.flow}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. INTERACTIVE MENSTRUAL PHASE LOGGING MODAL */}
      <Modal
        isOpen={phaseModalOpen}
        onClose={() => setPhaseModalOpen(false)}
        title={`Log Menstrual Phase`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-5 animate-fade-in text-slate-800 dark:text-slate-100">
          
          {/* Target Date Banner */}
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <div>
                <div className="text-xs font-black text-rose-900 dark:text-rose-200">
                  Selected Date: {modalDate}
                </div>
                <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                  Click a phase below to record for this day
                </div>
              </div>
            </div>
            <input
              type="date"
              value={modalDate}
              onChange={(e) => setModalDate(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-xl border border-rose-300 bg-white dark:bg-slate-900 font-bold"
            />
          </div>

          {/* Phase Selector - 4 Clear Options */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              1. Choose Cycle Phase
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(PHASES).map((ph) => {
                const isCurrent = selectedPhase === ph.id;
                return (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => setSelectedPhase(ph.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? `${ph.pillBg} shadow-md ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900 scale-102`
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{ph.icon}</span>
                      {isCurrent && <Check className="w-4 h-4 stroke-[3px]" />}
                    </div>
                    <div className="font-extrabold text-xs">
                      {ph.name}
                    </div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isCurrent ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
                      {ph.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If MENSTRUAL PHASE: Flow Intensity Selection */}
          {selectedPhase === 'menstrual' && (
            <div className="space-y-3 p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 animate-fade-in">
              <label className="block text-xs font-black text-rose-900 dark:text-rose-200">
                🩸 Menstrual Flow Intensity
              </label>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'Spotting', label: 'Spotting', icon: '🌸' },
                  { id: 'Light', label: 'Light Flow', icon: '💧' },
                  { id: 'Medium', label: 'Medium Flow', icon: '🩸' },
                  { id: 'Heavy', label: 'Heavy Flow', icon: '🩸🩸' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFlow(f.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedFlow === f.id
                        ? 'border-rose-500 bg-rose-500 text-white font-bold ring-2 ring-rose-400 shadow-xs'
                        : 'border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-lg leading-none mb-1">{f.icon}</div>
                    <div className="text-[10px] font-bold truncate">{f.label}</div>
                  </button>
                ))}
              </div>

              {/* Period Cycle Marker */}
              <div className="pt-2 border-t border-rose-200/80 dark:border-rose-900 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  Cycle Marker:
                </span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'start', label: 'Period Started' },
                    { id: 'ongoing', label: 'Ongoing Flow' },
                    { id: 'end', label: 'Period Ended' }
                  ].map((mark) => (
                    <button
                      key={mark.id}
                      type="button"
                      onClick={() => setPeriodMarker(mark.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors ${
                        periodMarker === mark.id
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {mark.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Optional Mood Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Optional: How is your mood today?
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = selectedMood?.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(isSelected ? null : m)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-lg leading-none">{m.emoji}</div>
                    <div className="text-[9px] mt-1 truncate">{m.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Common Symptoms */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Optional: Symptoms experienced
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.some(s => s.name === sym.name);
                return (
                  <button
                    key={sym.name}
                    type="button"
                    onClick={() => toggleSymptomSelection(sym)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold ring-2 ring-purple-400'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{sym.icon}</span>
                    <span className="text-[11px] truncate">{sym.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Personal Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Mild cramps in the morning, feeling well overall..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action Footer Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSavePhase}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5px]" />
              <span>Save Menstrual Phase for {modalDate}</span>
            </button>
            <button
              type="button"
              onClick={() => setPhaseModalOpen(false)}
              className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>
      </Modal>

      {/* 6. CONFIRMATION MODAL: DELETE CYCLE ENTRY */}
      <Modal
        isOpen={!!deleteModalData}
        onClose={() => setDeleteModalData(null)}
        title="Delete Period Record?"
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete the period record starting on <strong>{deleteModalData?.date}</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalData(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deletePeriodEntry(deleteModalData.cycleId, deleteModalData.date);
                setDeleteModalData(null);
              }}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Delete Record
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
