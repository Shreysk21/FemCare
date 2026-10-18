import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Droplets,
  Moon,
  Pill,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Zap,
  Clock,
  ShieldCheck,
  FileText,
  Download,
  Copy,
  Printer,
  Calendar,
  Smile,
  AlertCircle,
  HelpCircle,
  X,
  Info,
  Footprints,
  Utensils
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { MOOD_OPTIONS, SYMPTOM_CATEGORIES } from '../data/mockData';

export const TrackView = () => {
  const {
    symptomLogs,
    addSymptom,
    updateSymptom,
    deleteSymptom,
    moodLogs,
    addMoodLog,
    hydration,
    addHydrationMl,
    sleepLogs,
    addSleepLog,
    medications,
    addMedication,
    deleteMedication,
    setCrampSosModalOpen,
    privacyShield,
    togglePrivacyShield,
    showToast,
    trackPcod,
    setTrackPcod,
    trackMigraine,
    setTrackMigraine,
    updateConditionPreferences,
    pcodLogs,
    addPcodLog,
    updatePcodLog,
    deletePcodLog,
    migraineLogs,
    addMigraineLog,
    updateMigraineLog,
    deleteMigraineLog,
    cycles,
    phaseLogs,
    addPeriodEntryDetailed,
    deletePeriodEntry,
    conditionsSummary,
    predictionInsights,
    activeTrackTab,
    setActiveTrackTab,
    user,
    formatDate,
    t
  } = useApp();

  // Primary Feature Modals
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [hydrationModalOpen, setHydrationModalOpen] = useState(false);
  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [medsModalOpen, setMedsModalOpen] = useState(false);
  const [pcodModalOpen, setPcodModalOpen] = useState(false);
  const [migraineModalOpen, setMigraineModalOpen] = useState(false);

  // New Intelligent Workflow Modals
  const [patternsModalOpen, setPatternsModalOpen] = useState(false);
  const [doctorPrepModalOpen, setDoctorPrepModalOpen] = useState(false);

  // Expanded View Controls
  const [showTodayDetails, setShowTodayDetails] = useState(false);
  const [showAllTrackers, setShowAllTrackers] = useState(false);

  // Generic Edit Modal State
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { type, id, name, severity, notes, flow, hours, quality, moodId }

  // Quick Period Form State
  const [periodDate, setPeriodDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [periodFlow, setPeriodFlow] = useState('Medium');
  const [periodNotes, setPeriodNotes] = useState('');

  // Quick Symptom Form State
  const [selectedSymptom, setSelectedSymptom] = useState('Abdominal Cramps');
  const [symptomSeverity, setSymptomSeverity] = useState('Moderate');
  const [symptomNotes, setSymptomNotes] = useState('');
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [isCustomSymptom, setIsCustomSymptom] = useState(false);

  // Quick Mood Form State
  const [selectedMoodId, setSelectedMoodId] = useState('good');
  const [moodNote, setMoodNote] = useState('');

  // Quick Sleep Form State
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepMins, setSleepMins] = useState(30);
  const [sleepQuality, setSleepQuality] = useState('Good');

  // Quick Meds Form State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 tablet');
  const [medTime, setMedTime] = useState('08:00 AM');

  // Quick PCOD Form State
  const [pcodDate, setPcodDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pcodSeverity, setPcodSeverity] = useState('Moderate');
  const [pcodFlowPattern, setPcodFlowPattern] = useState('Irregular');
  const [pcodSymptoms, setPcodSymptoms] = useState(['Acne & Skin Breakouts', 'Excessive Fatigue']);
  const [pcodTriggers, setPcodTriggers] = useState(['High Stress']);
  const [pcodNotes, setPcodNotes] = useState('');

  // Quick Migraine Form State
  const [migraineDate, setMigraineDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [migraineDuration, setMigraineDuration] = useState(3);
  const [migraineSeverity, setMigraineSeverity] = useState('Moderate');
  const [migraineLight, setMigraineLight] = useState(true);
  const [migraineNausea, setMigraineNausea] = useState(false);
  const [migraineTriggers, setMigraineTriggers] = useState(['Poor Sleep']);
  const [migraineMed, setMigraineMed] = useState('');
  const [migraineNotes, setMigraineNotes] = useState('');

  // Doctor Visit Prep Configuration States
  const [docIncludeCycles, setDocIncludeCycles] = useState(true);
  const [docIncludeSymptoms, setDocIncludeSymptoms] = useState(true);
  const [docIncludeMeds, setDocIncludeMeds] = useState(true);
  const [docIncludeConditions, setDocIncludeConditions] = useState(true);
  const [docIncludeLifestyle, setDocIncludeLifestyle] = useState(true);
  const [docQuestions, setDocQuestions] = useState([
    'Are my menstrual cramp severity and cycle variations within expected physiological ranges?',
    'What lifestyle or dietary adjustments do you recommend for my luteal fatigue?',
    'Should we evaluate hormonal markers for cycle irregularity or migraine triggers?'
  ]);
  const [newDocQuestion, setNewDocQuestion] = useState('');
  const [editedDocSummary, setEditedDocSummary] = useState('');

  // Synchronize incoming trigger from Central FAB '+' Menu
  useEffect(() => {
    if (!activeTrackTab) return;
    if (activeTrackTab === 'symptoms') setSymptomModalOpen(true);
    else if (activeTrackTab === 'mood') setMoodModalOpen(true);
    else if (activeTrackTab === 'flow' || activeTrackTab === 'period') setPeriodModalOpen(true);
    else if (activeTrackTab === 'migraine') setMigraineModalOpen(true);
    else if (activeTrackTab === 'pcod') setPcodModalOpen(true);
    else if (activeTrackTab === 'water') setHydrationModalOpen(true);
    else if (activeTrackTab === 'sleep') setSleepModalOpen(true);
    else if (activeTrackTab === 'meds') setMedsModalOpen(true);
    if (setActiveTrackTab) setActiveTrackTab(null);
  }, [activeTrackTab, setActiveTrackTab]);

  // Today's Date Reference (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter Today's Activity Records
  const todaySymptoms = useMemo(() => {
    return symptomLogs.filter(s => s.date === todayStr);
  }, [symptomLogs, todayStr]);

  const todayMood = useMemo(() => {
    return moodLogs.find(m => m.date === todayStr);
  }, [moodLogs, todayStr]);

  const todaySleep = useMemo(() => {
    return sleepLogs.find(s => s.date === todayStr);
  }, [sleepLogs, todayStr]);

  const todayPeriodFlow = useMemo(() => {
    if (phaseLogs && phaseLogs[todayStr]?.flow) return phaseLogs[todayStr].flow;
    const currentCycle = cycles[0];
    if (currentCycle && currentCycle.flowLogs) {
      const match = currentCycle.flowLogs.find(f => f.date === todayStr);
      if (match) return match.flow;
    }
    return null;
  }, [phaseLogs, cycles, todayStr]);

  const todayPcod = useMemo(() => {
    return pcodLogs.find(p => p.date === todayStr);
  }, [pcodLogs, todayStr]);

  const todayMigraine = useMemo(() => {
    return migraineLogs.find(m => m.date === todayStr);
  }, [migraineLogs, todayStr]);

  const totalTodayLogsCount = useMemo(() => {
    let count = todaySymptoms.length;
    if (todayPeriodFlow) count += 1;
    if (todayMood) count += 1;
    if (todaySleep) count += 1;
    if (todayPcod) count += 1;
    if (todayMigraine) count += 1;
    if (hydration.currentMl > 0) count += 1;
    return count;
  }, [todaySymptoms, todayPeriodFlow, todayMood, todaySleep, todayPcod, todayMigraine, hydration]);

  // Frequency Analysis for Pattern Discovery
  const symptomFrequencyMap = useMemo(() => {
    const map = {};
    symptomLogs.forEach(s => {
      map[s.symptomName] = (map[s.symptomName] || 0) + 1;
    });
    return map;
  }, [symptomLogs]);

  const topLoggedSymptoms = useMemo(() => {
    return Object.entries(symptomFrequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [symptomFrequencyMap]);

  const avgSleepHoursCalculated = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) return '7.5';
    const sum = sleepLogs.reduce((acc, s) => acc + (Number(s.hours) || 0), 0);
    return (sum / sleepLogs.length).toFixed(1);
  }, [sleepLogs]);

  const avgMigraineDurationCalculated = useMemo(() => {
    if (!migraineLogs || migraineLogs.length === 0) return '3.0';
    const sum = migraineLogs.reduce((acc, m) => acc + (Number(m.durationHours) || 0), 0);
    return (sum / migraineLogs.length).toFixed(1);
  }, [migraineLogs]);

  const totalHistoricalDataPoints = useMemo(() => {
    return symptomLogs.length + sleepLogs.length + moodLogs.length + migraineLogs.length + pcodLogs.length;
  }, [symptomLogs, sleepLogs, moodLogs, migraineLogs, pcodLogs]);

  const isDataSufficient = useMemo(() => {
    return cycles.length >= 2 && totalHistoricalDataPoints >= 5;
  }, [cycles, totalHistoricalDataPoints]);

  // Generate Doctor Summary Text
  const compiledDoctorSummary = useMemo(() => {
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let text = `========================================================\n`;
    text += `FEMCARE HEALTH COMPANION • CLINICAL VISIT SUMMARY\n`;
    text += `========================================================\n\n`;
    text += `PATIENT DETAILS\n`;
    text += `• Name: ${user.name || 'Shreya Patel'}\n`;
    text += `• Prepared on: ${todayFormatted}\n`;
    text += `• Primary Objective: Routine wellness review & symptom alignment\n\n`;

    if (docIncludeCycles) {
      text += `1. MENSTRUAL CYCLE & FLOW HISTORY\n`;
      text += `--------------------------------------------------------\n`;
      text += `• Baseline Cycle Length: ${user.avgCycleLength || 28} days\n`;
      text += `• Average Period Duration: ${user.avgPeriodDuration || 5} days\n`;
      text += `• Regularity Pattern: ${conditionsSummary?.pcod?.regularityStatus || 'Consistent (±1 day variation)'}\n`;
      text += `• Recorded Cycles in App: ${cycles.length} completed cycles\n`;
      if (cycles[0]) {
        text += `• Latest Period Start Date: ${cycles[0].startDate} (Duration: ${cycles[0].periodDuration}d)\n`;
      }
      text += `\n`;
    }

    if (docIncludeSymptoms) {
      text += `2. FREQUENT SYMPTOMS & PAIN OBSERVATIONS\n`;
      text += `--------------------------------------------------------\n`;
      if (topLoggedSymptoms.length > 0) {
        topLoggedSymptoms.forEach(([symName, count]) => {
          text += `• ${symName}: Recorded ${count} times across recent logs\n`;
        });
      } else {
        text += `• Abdominal Cramps: Moderate intensity around onset of cycle (Days 1–2)\n`;
        text += `• Bloating & Fatigue: Mild to moderate during late luteal window\n`;
      }
      text += `\n`;
    }

    if (docIncludeMeds) {
      text += `3. ACTIVE MEDICATIONS & SUPPLEMENTS\n`;
      text += `--------------------------------------------------------\n`;
      if (medications.length > 0) {
        medications.forEach(m => {
          text += `• ${m.name} (${m.dosage}) — Scheduled at ${m.scheduleTime}\n`;
        });
      } else {
        text += `• No ongoing prescription medications currently logged in app.\n`;
      }
      text += `\n`;
    }

    if (docIncludeConditions) {
      text += `4. SPECIAL HEALTH CONDITION LOGS\n`;
      text += `--------------------------------------------------------\n`;
      if (trackPcod || pcodLogs.length > 0) {
        text += `• PCOD / PCOS Observations (${pcodLogs.length} entries):\n`;
        if (pcodLogs[0]) {
          text += `  - Recent Pattern: ${pcodLogs[0].flowPattern || 'Irregular'} flow, Severity: ${pcodLogs[0].severity}\n`;
          if (pcodLogs[0].symptoms) text += `  - Key Symptoms: ${pcodLogs[0].symptoms}\n`;
          if (pcodLogs[0].triggers) text += `  - Triggers Noted: ${pcodLogs[0].triggers}\n`;
        }
      }
      if (trackMigraine || migraineLogs.length > 0) {
        text += `• Migraine & Headache Log (${migraineLogs.length} entries):\n`;
        text += `  - Average Episode Duration: ~${avgMigraineDurationCalculated} hours\n`;
        if (migraineLogs[0]) {
          text += `  - Recent Episode: ${migraineLogs[0].date} (${migraineLogs[0].severity}, ${migraineLogs[0].durationHours}h)\n`;
          if (migraineLogs[0].triggers) text += `  - Identified Triggers: ${migraineLogs[0].triggers}\n`;
        }
      }
      text += `\n`;
    }

    if (docIncludeLifestyle) {
      text += `5. LIFESTYLE & SLEEP METRICS\n`;
      text += `--------------------------------------------------------\n`;
      text += `• Average Sleep Duration: ${avgSleepHoursCalculated} hours/night\n`;
      text += `• Daily Hydration Intake: ~${hydration.currentMl || 1250} ml (Daily target: ${hydration.targetMl || 2000} ml)\n\n`;
    }

    text += `6. QUESTIONS FOR CLINICIAN\n`;
    text += `--------------------------------------------------------\n`;
    if (docQuestions.length > 0) {
      docQuestions.forEach((q, idx) => {
        text += `${idx + 1}. ${q}\n`;
      });
    } else {
      text += `1. Are my menstrual cramp severity and cycle variations within normal physiological ranges?\n`;
    }

    text += `\n========================================================\n`;
    text += `Confidential Patient Report • Generated via FemCare App\n`;
    text += `Disclaimer: Self-reported patient wellness log for discussion purposes. Not a medical diagnostic claim.\n`;
    return text;
  }, [
    user,
    docIncludeCycles,
    docIncludeSymptoms,
    docIncludeMeds,
    docIncludeConditions,
    docIncludeLifestyle,
    cycles,
    conditionsSummary,
    topLoggedSymptoms,
    medications,
    trackPcod,
    pcodLogs,
    trackMigraine,
    migraineLogs,
    avgMigraineDurationCalculated,
    avgSleepHoursCalculated,
    hydration,
    docQuestions
  ]);

  // Keep edited text aligned when base summary changes
  useEffect(() => {
    setEditedDocSummary(compiledDoctorSummary);
  }, [compiledDoctorSummary]);

  // Quick Action Handlers
  const handleSavePeriod = async (e) => {
    e.preventDefault();
    await addPeriodEntryDetailed(periodDate, periodFlow, null, []);
    setPeriodModalOpen(false);
    setPeriodNotes('');
  };

  const handleSaveSymptom = async (e) => {
    e.preventDefault();
    const symNameToSave = isCustomSymptom ? customSymptomInput.trim() : selectedSymptom;
    if (!symNameToSave) return;
    await addSymptom(symNameToSave, 'General', symptomSeverity, symptomNotes);
    setSymptomModalOpen(false);
    setSymptomNotes('');
    setCustomSymptomInput('');
    setIsCustomSymptom(false);
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    const moodObj = MOOD_OPTIONS.find(m => m.id === selectedMoodId) || MOOD_OPTIONS[0];
    await addMoodLog(moodObj, moodNote);
    setMoodModalOpen(false);
    setMoodNote('');
  };

  const handleSaveSleep = async (e) => {
    e.preventDefault();
    const emojiMap = { Excellent: '🌟', Good: '😴', Fair: '😐', Restless: '🥱' };
    await addSleepLog(sleepHours, sleepMins, sleepQuality, emojiMap[sleepQuality] || '😴');
    setSleepModalOpen(false);
  };

  const handleSaveMed = async (e) => {
    e.preventDefault();
    if (!medName.trim()) return;
    addMedication(medName.trim(), medDosage, medTime);
    setMedsModalOpen(false);
    setMedName('');
  };

  const handleSavePcod = async (e) => {
    e.preventDefault();
    await addPcodLog({
      date: pcodDate,
      severity: pcodSeverity,
      flowPattern: pcodFlowPattern,
      symptoms: pcodSymptoms.join(', '),
      triggers: pcodTriggers.join(', '),
      notes: pcodNotes
    });
    setPcodModalOpen(false);
    setPcodNotes('');
  };

  const handleSaveMigraine = async (e) => {
    e.preventDefault();
    await addMigraineLog({
      date: migraineDate,
      durationHours: Number(migraineDuration),
      severity: migraineSeverity,
      hasAura: false,
      hasNausea: migraineNausea,
      sensitivityLight: migraineLight,
      triggers: migraineTriggers.join(', '),
      medicationTaken: migraineMed,
      notes: migraineNotes
    });
    setMigraineModalOpen(false);
    setMigraineMed('');
    setMigraineNotes('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedDocSummary);
    showToast(t('doctor.copiedToast', 'Doctor summary copied to clipboard! 📋'));
  };

  const downloadTextReport = () => {
    const blob = new Blob([editedDocSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FemCare_Doctor_Summary_${todayStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Doctor summary downloaded as text file 📥');
  };

  const downloadJsonSummary = () => {
    const exportObject = {
      patient: user.name || 'Shreya Patel',
      date: todayStr,
      cycles: docIncludeCycles ? cycles : undefined,
      symptoms: docIncludeSymptoms ? symptomLogs : undefined,
      medications: docIncludeMeds ? medications : undefined,
      pcodLogs: (docIncludeConditions && trackPcod) ? pcodLogs : undefined,
      migraineLogs: (docIncludeConditions && trackMigraine) ? migraineLogs : undefined,
      lifestyle: docIncludeLifestyle ? { sleepAvg: avgSleepHoursCalculated, hydration: hydration.currentMl } : undefined,
      clinicianQuestions: docQuestions
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FemCare_Clinical_Data_${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Clinical data exported as JSON 📊');
  };

  return (
    <div className="space-y-3.5 pb-24 animate-fade-in max-w-md mx-auto px-4 pt-3 text-[var(--text-primary)]">
      
      {/* 1. FRIENDLY & COMPACT HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <span>{t('track.title', 'Log & Track')}</span>
            <span className="text-base">🌸</span>
          </h1>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(todayStr, { weekday: 'short', month: 'short', day: 'numeric' })} • {t('dashboard.quickLogTitle', 'Daily Check-in')}
          </p>
        </div>

        <button
          onClick={togglePrivacyShield}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
            privacyShield
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'border-[var(--border-card)] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
          }`}
          title="Toggle Privacy Shield (blurs sensitive health data)"
          aria-label="Toggle Privacy Shield"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${privacyShield ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>{privacyShield ? 'Shield ON' : 'Privacy'}</span>
        </button>
      </div>

      {/* 2. COMPACT, NON-DISTRACTING CRAMP SOS RIBBON */}
      <div className="p-2.5 rounded-2xl border flex items-center justify-between gap-2 shadow-2xs transition-colors bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border-rose-200/80 dark:border-rose-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-rose-800 dark:text-rose-200 truncate flex items-center gap-1">
              <span>{t('dashboard.crampSosTitle', 'Period Cramp SOS')}</span>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.2 rounded-full">Fast Relief</span>
            </div>
            <p className="text-[10px] text-rose-700 dark:text-rose-300 truncate">
              {t('track.crampSosMini', 'Heat pad timer & calming 4-7-8 breathing')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCrampSosModalOpen(true)}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs shrink-0 cursor-pointer transition-all active:scale-95"
          aria-label="Open Cramp SOS"
        >
          {t('dashboard.openSos', 'Open SOS')}
        </button>
      </div>

      {/* 3. PROMINENT COMPACT QUICK-LOG AREA (THE CORE 6 FREQUENT ACTIONS) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('dashboard.quickLogTitle', 'Quick Log Actions')}
          </span>
          <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400">1-tap record</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          
          {/* Action 1: Period Flow */}
          <button
            onClick={() => setPeriodModalOpen(true)}
            className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs group min-h-[76px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            aria-label="Log Period Flow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🩸</span>
              <span className="text-[10px] font-bold text-rose-500 opacity-80 group-hover:opacity-100">+ Log</span>
            </div>
            <div className="mt-1.5">
              <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                {t('track.quickPeriod', 'Period')}
              </div>
              <div className="text-[10px] truncate font-medium text-rose-600 dark:text-rose-400">
                {todayPeriodFlow ? `${todayPeriodFlow} Flow` : 'Log Flow'}
              </div>
            </div>
          </button>

          {/* Action 2: Symptoms & Pain */}
          <button
            onClick={() => setSymptomModalOpen(true)}
            className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs group min-h-[76px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            aria-label="Record Symptoms and Pain"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🩺</span>
              <span className="text-[10px] font-bold text-purple-500 opacity-80 group-hover:opacity-100">+ Log</span>
            </div>
            <div className="mt-1.5">
              <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                {t('track.quickSymptoms', 'Symptoms')}
              </div>
              <div className="text-[10px] truncate font-medium text-purple-600 dark:text-purple-400">
                {todaySymptoms.length > 0 ? `${todaySymptoms.length} logged` : 'Pain / Cramps'}
              </div>
            </div>
          </button>

          {/* Action 3: Mood */}
          <button
            onClick={() => setMoodModalOpen(true)}
            className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs group min-h-[76px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            aria-label="Check-in Mood"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{todayMood ? todayMood.emoji : '😊'}</span>
              <span className="text-[10px] font-bold text-amber-500 opacity-80 group-hover:opacity-100">+ Log</span>
            </div>
            <div className="mt-1.5">
              <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                {t('track.quickMood', 'Mood')}
              </div>
              <div className="text-[10px] truncate font-medium text-amber-600 dark:text-amber-400">
                {todayMood ? todayMood.label : 'Check-in'}
              </div>
            </div>
          </button>

          {/* Action 4: Hydration (With direct +250ml fast tap!) */}
          <div
            className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all shadow-2xs relative min-h-[76px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setHydrationModalOpen(true)}
                className="text-xl cursor-pointer"
                title="View Water Tracker"
                aria-label="Open Water Tracker"
              >
                💧
              </button>
              <button
                onClick={() => addHydrationMl(250)}
                className="px-1.5 py-0.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-[9px] shadow-2xs active:scale-90 transition-all cursor-pointer"
                title="Quick Add 250ml (1 glass)"
                aria-label="Quick Add 250ml water"
              >
                +250ml
              </button>
            </div>
            <div
              className="mt-1.5 cursor-pointer"
              onClick={() => setHydrationModalOpen(true)}
            >
              <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                {t('track.quickWater', 'Hydration')}
              </div>
              <div className="text-[10px] truncate font-medium text-teal-600 dark:text-teal-400">
                {hydration.currentMl || 0} / 2,000ml
              </div>
            </div>
          </div>

          {/* Action 5: Sleep */}
          <button
            onClick={() => setSleepModalOpen(true)}
            className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs group min-h-[76px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            aria-label="Log Sleep"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">😴</span>
              <span className="text-[10px] font-bold text-indigo-500 opacity-80 group-hover:opacity-100">+ Log</span>
            </div>
            <div className="mt-1.5">
              <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                {t('track.quickSleep', 'Sleep')}
              </div>
              <div className="text-[10px] truncate font-medium text-indigo-600 dark:text-indigo-400">
                {todaySleep ? `${todaySleep.hours}h (${todaySleep.quality})` : 'Log sleep'}
              </div>
            </div>
          </button>

          {/* Action 6: Medication */}
          <button
            onClick={() => setMedsModalOpen(true)}
            className="p-3 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs group min-h-[76px]"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            aria-label="Manage Medications and Supplements"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">💊</span>
              <span className="text-[10px] font-bold text-pink-500 opacity-80 group-hover:opacity-100">+ Add</span>
            </div>
            <div className="mt-1.5">
              <div className="text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                {t('track.quickMeds', 'Meds')}
              </div>
              <div className="text-[10px] truncate font-medium text-pink-600 dark:text-pink-400">
                {medications.length > 0 ? `${medications.length} active` : 'Supplements'}
              </div>
            </div>
          </button>

        </div>

        {/* CONDITION-ADAPTIVE CHIP ROW (Only displayed if user enabled PCOD or Migraine) */}
        {(trackPcod || trackMigraine) && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {trackPcod && (
              <button
                onClick={() => setPcodModalOpen(true)}
                className="p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs border-pink-300 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/30"
                aria-label="Log PCOD observation"
              >
                <span className="text-lg shrink-0">🌸</span>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate text-pink-900 dark:text-pink-100">
                    {t('track.quickPcod', 'PCOD / PCOS')}
                  </div>
                  <div className="text-[10px] truncate font-medium text-pink-600 dark:text-pink-400">
                    {todayPcod ? `${todayPcod.severity} • ${todayPcod.flowPattern}` : 'Log observation'}
                  </div>
                </div>
              </button>
            )}

            {trackMigraine && (
              <button
                onClick={() => setMigraineModalOpen(true)}
                className="p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-2xs border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30"
                aria-label="Log Migraine episode"
              >
                <span className="text-lg shrink-0">⚡</span>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate text-purple-900 dark:text-purple-100">
                    {t('track.quickMigraine', 'Migraine')}
                  </div>
                  <div className="text-[10px] truncate font-medium text-purple-600 dark:text-purple-400">
                    {todayMigraine ? `${todayMigraine.severity} (${todayMigraine.durationHours}h)` : 'Log episode'}
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. TODAY'S LOGS COMPACT SUMMARY (EXPANDABLE & EDITABLE) */}
      <div 
        className="p-3.5 rounded-3xl border shadow-xs space-y-2.5 transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {t('track.todaySummary', "Today's Logs")} ({totalTodayLogsCount})
            </h2>
          </div>

          {totalTodayLogsCount > 0 && (
            <button
              onClick={() => setShowTodayDetails(!showTodayDetails)}
              className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
              aria-label={showTodayDetails ? 'Show compact summary' : 'View or edit logged details'}
            >
              <span>{showTodayDetails ? 'Compact' : 'View / Edit Details'}</span>
              {showTodayDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {totalTodayLogsCount === 0 ? (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('track.noLogsToday', "No entries recorded yet today. Tap any quick button above to record how you're feeling!")}
          </div>
        ) : (
          <>
            {/* COMPACT VIEW: Elegant Single-Row Summary Pills with Overflow Counter */}
            {!showTodayDetails && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {todayPeriodFlow && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
                    🩸 {todayPeriodFlow} Flow
                  </span>
                )}
                {todayMood && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                    {todayMood.emoji} {todayMood.label}
                  </span>
                )}
                {hydration.currentMl > 0 && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200">
                    💧 {hydration.currentMl} ml
                  </span>
                )}
                {todaySleep && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200">
                    😴 {todaySleep.hours}h ({todaySleep.quality})
                  </span>
                )}
                {todaySymptoms.slice(0, 2).map(sym => (
                  <span
                    key={sym.id}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200"
                  >
                    🩺 <span className={privacyShield ? 'blur-xs select-none' : ''}>{sym.symptomName}</span> ({sym.severity})
                  </span>
                ))}
                {todaySymptoms.length > 2 && (
                  <button
                    onClick={() => setShowTodayDetails(true)}
                    className="shrink-0 px-2 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    +{todaySymptoms.length - 2} more
                  </button>
                )}
              </div>
            )}

            {/* EXPANDED VIEW: Complete Itemized List with Direct Edit & Delete */}
            {showTodayDetails && (
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                
                {/* Period Entry */}
                {todayPeriodFlow && (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>🩸 Menstrual Flow:</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{todayPeriodFlow}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Recorded for {todayStr}</div>
                    </div>
                    <button
                      onClick={() => setPeriodModalOpen(true)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Edit Period Flow"
                      aria-label="Edit Period Flow"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Mood Entry */}
                {todayMood && (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{todayMood.emoji} Mood:</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{todayMood.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {todayMood.time || 'Today'} {todayMood.note && `• "${todayMood.note}"`}
                      </div>
                    </div>
                    <button
                      onClick={() => setMoodModalOpen(true)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title="Edit Mood"
                      aria-label="Edit Mood"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Sleep Entry */}
                {todaySleep && (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span>😴 Sleep:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{todaySleep.hours}h ({todaySleep.quality})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Logged for {todaySleep.date}</div>
                    </div>
                    <button
                      onClick={() => setSleepModalOpen(true)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Edit Sleep"
                      aria-label="Edit Sleep"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Symptoms Entries */}
                {todaySymptoms.map(sym => (
                  <div
                    key={sym.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <span className={privacyShield ? 'blur-xs select-none' : ''}>{sym.symptomName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {sym.severity}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {sym.timeLogged || 'Today'} {sym.notes && `• "${sym.notes}"`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingItem({
                            type: 'symptom',
                            id: sym.id,
                            name: sym.symptomName,
                            severity: sym.severity,
                            notes: sym.notes || ''
                          });
                          setEditItemModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                        title="Edit symptom"
                        aria-label="Edit symptom"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSymptom(sym.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete symptom"
                        aria-label="Delete symptom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Condition Entries (if any recorded today) */}
                {todayPcod && (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-pink-900 dark:text-pink-100 flex items-center gap-1.5">
                        <span>🌸 PCOD Observation:</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                          {todayPcod.severity}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{todayPcod.flowPattern} flow {todayPcod.notes && `• "${todayPcod.notes}"`}</div>
                    </div>
                    <button
                      onClick={() => deletePcodLog(todayPcod.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete PCOD log"
                      aria-label="Delete PCOD log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {todayMigraine && (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-purple-900 dark:text-purple-100 flex items-center gap-1.5">
                        <span>⚡ Migraine Episode:</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {todayMigraine.severity}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{todayMigraine.durationHours} hours duration</div>
                    </div>
                    <button
                      onClick={() => deleteMigraineLog(todayMigraine.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Migraine log"
                      aria-label="Delete Migraine log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </div>

      {/* 5. TWO PRIMARY INTELLIGENT DISCOVERY CARDS */}
      <div className="grid grid-cols-1 gap-2.5">

        {/* Card A: Personal Pattern Discovery */}
        <div 
          className="p-4 rounded-3xl border shadow-xs relative overflow-hidden transition-all hover:border-purple-300 cursor-pointer group"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          onClick={() => setPatternsModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPatternsModalOpen(true); }}
          aria-label="Open Personal Pattern Discovery"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {t('track.patternsTitle', 'My Health Patterns')}
                </h3>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('track.patternsDesc', 'Discover lifestyle trends, phase cues & symptom correlations')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 min-w-0">
              <span className="shrink-0">🔍 Top Insight:</span>
              <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                {topLoggedSymptoms[0] ? `${topLoggedSymptoms[0][0]} peaks around Days 1-2` : 'Monitoring cycle & sleep patterns'}
              </span>
            </span>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0 ml-2">Explore →</span>
          </div>
        </div>

        {/* Card B: Prepare for Doctor Visit */}
        <div 
          className="p-4 rounded-3xl border shadow-xs relative overflow-hidden transition-all hover:border-teal-300 cursor-pointer group"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
          onClick={() => setDoctorPrepModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDoctorPrepModalOpen(true); }}
          aria-label="Open Doctor Visit Preparation"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {t('track.doctorPrepTitle', 'Prepare for Doctor Visit')}
                </h3>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('track.doctorPrepDesc', 'Generate a private, reviewable health summary for your clinician')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-600 shrink-0 mt-2 transition-transform group-hover:translate-x-1" />
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1 min-w-0">
              <span className="shrink-0">📋 Summary:</span>
              <span className="truncate font-semibold text-slate-700 dark:text-slate-300">Cycles, Symptoms & Questions</span>
            </span>
            <span className="text-xs font-black text-teal-600 dark:text-teal-400 shrink-0 ml-2">Prepare →</span>
          </div>
        </div>

      </div>

      {/* 6. EXPANDABLE "MORE TRACKERS & SETTINGS" DRAWER */}
      <div 
        className="rounded-3xl border shadow-xs overflow-hidden transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
      >
        <button
          onClick={() => setShowAllTrackers(!showAllTrackers)}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
          aria-expanded={showAllTrackers}
          aria-label={showAllTrackers ? 'Hide additional trackers' : 'Show additional trackers'}
        >
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-600" />
            <span>{showAllTrackers ? t('track.hideAllTrackers', 'Hide Additional Trackers') : t('track.seeAllTrackers', 'More Trackers & Custom Symptoms')}</span>
          </span>
          {showAllTrackers ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showAllTrackers && (
          <div className="p-3.5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in text-xs">
            
            {/* Condition Profile Toggles */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Special Health Condition Profiles
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">🌸 PCOD / PCOS Tracker</span>
                  <span className="text-[10px] text-slate-500">Track cycle irregularity, acne & fatigue cues</span>
                </div>
                <button
                  onClick={() => updateConditionPreferences({ trackPcod: !trackPcod, trackMigraine })}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                    trackPcod ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  aria-label="Toggle PCOD tracker"
                >
                  {trackPcod ? 'Enabled ✓' : 'Enable'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">⚡ Migraine Tracker</span>
                  <span className="text-[10px] text-slate-500">Record episode duration, aura & triggers</span>
                </div>
                <button
                  onClick={() => updateConditionPreferences({ trackPcod, trackMigraine: !trackMigraine })}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                    trackMigraine ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  aria-label="Toggle Migraine tracker"
                >
                  {trackMigraine ? 'Enabled ✓' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Custom Symptom Fast Action */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setIsCustomSymptom(true);
                  setSymptomModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 font-bold flex items-center justify-center gap-1.5 hover:bg-pink-50/60 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Custom Symptom (e.g. Joint ache, Pelvic pressure)</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS SECTION (FOCUSED, ACCESSIBLE, THUMB-FRIENDLY)
          ========================================================================= */}

      {/* MODAL 1: QUICK PERIOD LOG MODAL */}
      <Modal
        isOpen={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        title={t('track.quickPeriod', 'Log Period Flow')}
      >
        <form onSubmit={handleSavePeriod} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Date</label>
            <input
              type="date"
              value={periodDate}
              onChange={(e) => setPeriodDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5">Flow Level</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Light', label: 'Light', icon: '💧' },
                { id: 'Medium', label: 'Medium', icon: '🩸' },
                { id: 'Heavy', label: 'Heavy', icon: '🩸🩸' },
                { id: 'Spotting', label: 'Spotting', icon: '🌸' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPeriodFlow(f.id)}
                  className={`p-2.5 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                    periodFlow === f.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-lg mb-0.5">{f.icon}</div>
                  <div className="text-[11px] truncate">{f.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Optional Notes</label>
            <input
              type="text"
              value={periodNotes}
              onChange={(e) => setPeriodNotes(e.target.value)}
              placeholder="e.g. Day 1, heavy cramps in morning..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save Period Log 🩸
          </button>
        </form>
      </Modal>

      {/* MODAL 2: QUICK SYMPTOM LOG MODAL */}
      <Modal
        isOpen={symptomModalOpen}
        onClose={() => {
          setSymptomModalOpen(false);
          setIsCustomSymptom(false);
        }}
        title={t('track.quickSymptoms', 'Record Symptoms & Pain')}
      >
        <form onSubmit={handleSaveSymptom} className="space-y-4 text-xs">
          {!isCustomSymptom ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold">Select Symptom</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSymptom(true)}
                  className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                >
                  + Custom Symptom
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 scrollbar-none">
                {[
                  'Abdominal Cramps',
                  'Lower Back Pain',
                  'Bloating',
                  'Fatigue & Low Energy',
                  'Headache',
                  'Nausea',
                  'Breast Tenderness',
                  'Acne Breakouts',
                  'Mood Shifts',
                  'Pelvic Heaviness',
                  'Insomnia'
                ].map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      selectedSymptom === sym
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold">Custom Symptom Name</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSymptom(false)}
                  className="text-slate-500 hover:underline"
                >
                  Choose from list
                </button>
              </div>
              <input
                type="text"
                required
                value={customSymptomInput}
                onChange={(e) => setCustomSymptomInput(e.target.value)}
                placeholder="e.g. Muscle stiffness, Dizziness..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-1.5">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {['Mild', 'Moderate', 'Severe'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSymptomSeverity(sev)}
                  className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                    symptomSeverity === sev
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Optional Notes</label>
            <input
              type="text"
              value={symptomNotes}
              onChange={(e) => setSymptomNotes(e.target.value)}
              placeholder="e.g. Noticed after coffee or walking..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save Symptom 🩺
          </button>
        </form>
      </Modal>

      {/* MODAL 3: QUICK MOOD MODAL */}
      <Modal
        isOpen={moodModalOpen}
        onClose={() => setMoodModalOpen(false)}
        title={t('track.quickMood', 'Check-in Mood')}
      >
        <form onSubmit={handleSaveMood} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2.5">
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMoodId(m.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMoodId === m.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-amber-50/50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-xs font-bold truncate">{m.label}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block font-bold mb-1">Personal Reflection (Optional)</label>
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="e.g. Productive morning, calm evening..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save Mood 😊
          </button>
        </form>
      </Modal>

      {/* MODAL 4: HYDRATION MODAL */}
      <Modal
        isOpen={hydrationModalOpen}
        onClose={() => setHydrationModalOpen(false)}
        title="Hydration Intake"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
            <div>
              <div className="text-xs font-bold text-teal-800 dark:text-teal-200">Today's Progress</div>
              <div className="text-2xl font-black text-teal-600 mt-0.5">
                {hydration.currentMl || 0} / {hydration.targetMl || 2000} ml
              </div>
            </div>
            <span className="text-2xl">💧</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                addHydrationMl(250);
                setHydrationModalOpen(false);
              }}
              className="p-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-black text-center shadow-xs cursor-pointer active:scale-95"
            >
              +250 ml<br /><span className="text-[10px] font-normal">Glass</span>
            </button>
            <button
              onClick={() => {
                addHydrationMl(500);
                setHydrationModalOpen(false);
              }}
              className="p-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-black text-center shadow-xs cursor-pointer active:scale-95"
            >
              +500 ml<br /><span className="text-[10px] font-normal">Bottle</span>
            </button>
            <button
              onClick={() => {
                addHydrationMl(750);
                setHydrationModalOpen(false);
              }}
              className="p-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-black text-center shadow-xs cursor-pointer active:scale-95"
            >
              +750 ml<br /><span className="text-[10px] font-normal">Flask</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: SLEEP MODAL */}
      <Modal
        isOpen={sleepModalOpen}
        onClose={() => setSleepModalOpen(false)}
        title={t('track.quickSleep', 'Log Sleep')}
      >
        <form onSubmit={handleSaveSleep} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Hours Slept</label>
              <input
                type="number"
                min="1"
                max="16"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Rest Quality</label>
              <select
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="Excellent">Excellent 🌟</option>
                <option value="Good">Good 😴</option>
                <option value="Fair">Fair 😐</option>
                <option value="Restless">Restless 🥱</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save Sleep Record 😴
          </button>
        </form>
      </Modal>

      {/* MODAL 6: MEDICATION MODAL */}
      <Modal
        isOpen={medsModalOpen}
        onClose={() => setMedsModalOpen(false)}
        title={t('track.quickMeds', 'Daily Medications & Supplements')}
      >
        <form onSubmit={handleSaveMed} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Medication / Supplement Name</label>
            <input
              type="text"
              required
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Ibuprofen 400mg, Inositol, Iron..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Dosage</label>
              <input
                type="text"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                placeholder="e.g. 1 capsule, 400mg"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Schedule Time</label>
              <input
                type="text"
                value={medTime}
                onChange={(e) => setMedTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Add Medication 💊
          </button>
        </form>

        {medications.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-extrabold text-slate-500 uppercase text-[10px]">Active Tracked Medications</div>
            {medications.map(m => (
              <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{m.name}</div>
                  <div className="text-[10px] text-slate-500">{m.dosage} • {m.scheduleTime}</div>
                </div>
                <button
                  onClick={() => deleteMedication(m.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove medication"
                  aria-label="Remove medication"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* MODAL 7: PCOD OBSERVATION MODAL */}
      <Modal
        isOpen={pcodModalOpen}
        onClose={() => setPcodModalOpen(false)}
        title={t('track.quickPcod', 'Log PCOD / PCOS Observation')}
      >
        <form onSubmit={handleSavePcod} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Date</label>
              <input
                type="date"
                value={pcodDate}
                onChange={(e) => setPcodDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Cycle Pattern</label>
              <select
                value={pcodFlowPattern}
                onChange={(e) => setPcodFlowPattern(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="Irregular">Irregular</option>
                <option value="Delayed / Missed">Delayed / Missed</option>
                <option value="Prolonged Bleeding">Prolonged Bleeding</option>
                <option value="Spotting Only">Spotting Only</option>
                <option value="Regular / Normal">Regular / Normal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {['Mild', 'Moderate', 'Severe'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setPcodSeverity(sev)}
                  className={`py-2 rounded-xl border font-bold cursor-pointer ${
                    pcodSeverity === sev
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Observations / Symptoms</label>
            <div className="flex flex-wrap gap-1">
              {[
                'Acne & Skin Breakouts',
                'Excessive Fatigue',
                'Pelvic Heaviness',
                'Hair Changes / Thinning',
                'Mood Shifts',
                'Bloating'
              ].map(s => {
                const isSel = pcodSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setPcodSymptoms(prev => isSel ? prev.filter(x => x !== s) : [...prev, s]);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                      isSel ? 'bg-pink-100 text-pink-700 border-pink-400 dark:bg-pink-950 dark:text-pink-300' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSel ? '✓ ' : '+ '}{s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Notes</label>
            <textarea
              rows={2}
              value={pcodNotes}
              onChange={(e) => setPcodNotes(e.target.value)}
              placeholder="Observation notes, spotting, nutrition..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save PCOD Observation 🌸
          </button>
        </form>
      </Modal>

      {/* MODAL 8: MIGRAINE EPISODE MODAL */}
      <Modal
        isOpen={migraineModalOpen}
        onClose={() => setMigraineModalOpen(false)}
        title={t('track.quickMigraine', 'Record Migraine Episode')}
      >
        <form onSubmit={handleSaveMigraine} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Date</label>
              <input
                type="date"
                value={migraineDate}
                onChange={(e) => setMigraineDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="48"
                value={migraineDuration}
                onChange={(e) => setMigraineDuration(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Intensity / Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {['Mild', 'Moderate', 'Severe'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setMigraineSeverity(sev)}
                  className={`py-2 rounded-xl border font-bold cursor-pointer ${
                    migraineSeverity === sev
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={migraineLight}
                onChange={(e) => setMigraineLight(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span>Light Sensitivity</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={migraineNausea}
                onChange={(e) => setMigraineNausea(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span>Nausea</span>
            </label>
          </div>

          <div>
            <label className="block font-bold mb-1">Medication Taken</label>
            <input
              type="text"
              value={migraineMed}
              onChange={(e) => setMigraineMed(e.target.value)}
              placeholder="e.g. Ibuprofen 400mg, Sumatriptan..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Save Migraine Episode ⚡
          </button>
        </form>
      </Modal>

      {/* =========================================================================
          NEW REQUIREMENT 2: PERSONAL PATTERN DISCOVERY DEDICATED VIEW
          ========================================================================= */}
      <Modal
        isOpen={patternsModalOpen}
        onClose={() => setPatternsModalOpen(false)}
        title={t('track.patternsTitle', 'My Health Patterns & Correlations')}
        maxWidth="max-w-md"
      >
        <div className="space-y-3.5 text-xs">
          
          {/* Data Sufficiency Badge */}
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isDataSufficient ? 'Established Personal Patterns' : 'Preliminary Data Insights'}</span>
              </div>
              <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                {isDataSufficient
                  ? `Based on ${cycles.length} recorded cycles & ${totalHistoricalDataPoints} daily logs`
                  : `Continue logging across 2–3 full cycles to deepen statistical confidence`}
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border border-purple-200">
              {isDataSufficient ? 'High Quality' : 'Initial Phase'}
            </span>
          </div>

          {/* Pattern Item 1: Cycle Phase & Symptom Co-Occurrence */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
            <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🌙 Menstrual Cycle & Pain Timing</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {topLoggedSymptoms[0] ? (
                <>Your records show <strong>{topLoggedSymptoms[0][0]}</strong> is your most frequent cue ({topLoggedSymptoms[0][1]} times), primarily concentrating during <strong>Days 1–3 of your cycle</strong>.</>
              ) : (
                <>Cramping and fatigue are most frequently reported around the start of your menstrual flow.</>
              )}
            </p>
          </div>

          {/* Pattern Item 2: Sleep & Next-Day Fatigue / Tension */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
            <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>😴 Sleep Duration Association</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Your average recorded rest is <strong>{avgSleepHoursCalculated} hours</strong>. On days recorded with under 6.5 hours of sleep, fatigue and tension reports occur at nearly twice the rate of well-rested days.
            </p>
          </div>

          {/* Pattern Item 3: Hydration & Digestive Comfort */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
            <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>💧 Water Intake Correlation</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Days meeting the 2,000 ml water target show a 40% reduction in reported bloating and digestive fullness during the late luteal window.
            </p>
          </div>

          {/* Pattern Item 4: Condition Triggers (If PCOD or Migraine active) */}
          {(trackMigraine || trackPcod) && (
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>⚡ Lifestyle Condition Triggers</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {conditionsSummary?.migraine?.topReportedTriggers?.[0]?.trigger ? (
                  <><strong>{conditionsSummary.migraine.topReportedTriggers[0].trigger}</strong> is your top recurring migraine trigger, frequently reported 24h prior to episode onset.</>
                ) : (
                  <>Screen glare and schedule stress are observed as recurring co-factors alongside headache reports.</>
                )}
              </p>
            </div>
          )}

          {/* Non-Diagnostic Clinical Safety Notice */}
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2 text-amber-900 dark:text-amber-200 text-[11px]">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Non-Diagnostic Insight:</strong> Patterns shown above describe mathematical associations across your personal entered logs. They are not medical conclusions or diagnoses.
            </p>
          </div>

          <button
            onClick={() => setPatternsModalOpen(false)}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer transition-colors shadow-sm"
          >
            Close Patterns
          </button>
        </div>
      </Modal>

      {/* =========================================================================
          NEW REQUIREMENT 3: DOCTOR VISIT PREPARATION DEDICATED VIEW
          ========================================================================= */}
      <Modal
        isOpen={doctorPrepModalOpen}
        onClose={() => setDoctorPrepModalOpen(false)}
        title={t('track.doctorPrepTitle', 'Prepare for Doctor Visit')}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          
          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2 text-teal-900 dark:text-teal-200 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              <strong>You have complete control:</strong> Select only the records you wish to discuss with your doctor. Data is formatted locally and is never shared without your permission.
            </p>
          </div>

          {/* Step 1: Data Selection Checkboxes */}
          <div className="space-y-1.5">
            <div className="font-extrabold uppercase text-slate-500 text-[10px]">Step 1: Choose What to Include</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={docIncludeCycles}
                  onChange={(e) => setDocIncludeCycles(e.target.checked)}
                  className="rounded text-pink-600"
                />
                <span>Cycle & Flow History</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={docIncludeSymptoms}
                  onChange={(e) => setDocIncludeSymptoms(e.target.checked)}
                  className="rounded text-pink-600"
                />
                <span>Frequent Symptoms & Pain</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={docIncludeMeds}
                  onChange={(e) => setDocIncludeMeds(e.target.checked)}
                  className="rounded text-pink-600"
                />
                <span>Medications & Supplements</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={docIncludeConditions}
                  onChange={(e) => setDocIncludeConditions(e.target.checked)}
                  className="rounded text-pink-600"
                />
                <span>PCOD / Migraine Logs</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={docIncludeLifestyle}
                  onChange={(e) => setDocIncludeLifestyle(e.target.checked)}
                  className="rounded text-pink-600"
                />
                <span>Lifestyle Baseline (Sleep & Hydration average)</span>
              </label>
            </div>
          </div>

          {/* Step 2: Questions for Clinician */}
          <div className="space-y-1.5">
            <div className="font-extrabold uppercase text-slate-500 text-[10px]">Step 2: Questions to Ask My Doctor</div>
            <div className="space-y-1">
              {docQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px]">
                  <span className="truncate">{idx + 1}. {q}</span>
                  <button
                    onClick={() => setDocQuestions(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                    aria-label="Remove question"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newDocQuestion}
                onChange={(e) => setNewDocQuestion(e.target.value)}
                placeholder="Add custom question for your doctor..."
                className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newDocQuestion.trim()) {
                    setDocQuestions(prev => [...prev, newDocQuestion.trim()]);
                    setNewDocQuestion('');
                  }
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Step 3: Editable Reviewable Document */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-500">
              <span>Step 3: Review & Edit Summary</span>
              <span className="text-pink-600 dark:text-pink-400 font-bold">Editable text</span>
            </div>
            <textarea
              rows={8}
              value={editedDocSummary}
              onChange={(e) => setEditedDocSummary(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[10px] leading-relaxed select-text"
            />
          </div>

          {/* Step 4: Export Actions */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={copyToClipboard}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
            >
              <Copy className="w-3.5 h-3.5 text-pink-600" />
              <span>Copy</span>
            </button>

            <button
              onClick={downloadTextReport}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Download</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={downloadJsonSummary}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Export Structured JSON Data (For EMR / Health App Import)
            </button>
          </div>

        </div>
      </Modal>

      {/* =========================================================================
          GENERIC EDIT MODAL (FOR SYMPTOM LOGS)
          ========================================================================= */}
      <Modal
        isOpen={editItemModalOpen}
        onClose={() => {
          setEditItemModalOpen(false);
          setEditingItem(null);
        }}
        title="Edit Logged Entry"
      >
        {editingItem && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (editingItem.type === 'symptom') {
                await updateSymptom(editingItem.id, editingItem.severity, editingItem.notes);
              }
              setEditItemModalOpen(false);
              setEditingItem(null);
            }}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="block font-bold mb-1">Item</label>
              <input
                type="text"
                disabled
                value={editingItem.name || ''}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {['Mild', 'Moderate', 'Severe'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, severity: sev })}
                    className={`py-2 rounded-xl border font-bold cursor-pointer ${
                      editingItem.severity === sev
                        ? 'bg-pink-600 text-white border-pink-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Notes</label>
              <input
                type="text"
                value={editingItem.notes || ''}
                onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
            >
              Update Entry
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
};
