import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, Droplets, Moon, Footprints, RefreshCw, ArrowRight, Quote, Hospital, Users, ShoppingBag, Flame, Activity, Thermometer, Zap, CheckCircle2, Heart, ShieldAlert, HeartPulse } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PhaseEnergyCard } from '../components/PhaseEnergyCard';

export const HomeDashboard = () => {
  const {
    user,
    cycles,
    hydration,
    sleepLogs,
    activityLogs,
    currentQuote,
    nextQuote,
    addPeriodEntryDetailed,
    addHydrationMl,
    addMoodLog,
    addSymptom,
    setCurrentView,
    homePhaseMode,
    setHomePhaseMode,
    setCrampSosModalOpen,
    privacyShield,
    showToast,
    t,
    predictionInsights,
    trackPcod,
    trackMigraine
  } = useApp();

  const [quickLogModal, setQuickLogModal] = useState(null); // 'period', 'mood', 'symptom'
  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [periodLogDate, setPeriodLogDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Perceptual Feedback State for Norman's Gulf of Evaluation
  const [activeCareActions, setActiveCareActions] = useState({});
  const [selectedEnergy, setSelectedEnergy] = useState(8);
  const [selectedMucus, setSelectedMucus] = useState('Egg White (Fertile)');
  const [bbtValue, setBbtValue] = useState(97.8);

  const hasCycleData = Array.isArray(cycles) && cycles.length > 0;
  const currentCycle = hasCycleData ? cycles[0] : null;
  
  const today = new Date();
  let cycleDay = 1;
  if (currentCycle && currentCycle.startDate) {
    const start = new Date(currentCycle.startDate);
    const diffTime = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    cycleDay = diffTime >= 0 ? diffTime + 1 : 1;
  }

  // Dynamic Next Period Estimation (Informed by real user records)
  let displayNextPeriodDate = 'Log your period to estimate';
  if (predictionInsights?.isSufficientData && (predictionInsights?.nextPeriodEstimatedDate || predictionInsights?.nextEstimatedPeriodDate)) {
    displayNextPeriodDate = new Date(predictionInsights.nextPeriodEstimatedDate || predictionInsights.nextEstimatedPeriodDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  } else if (hasCycleData && currentCycle?.startDate) {
    const start = new Date(currentCycle.startDate);
    const estCycleLength = user?.avgCycleLength || 28;
    const estDate = new Date(start);
    estDate.setDate(start.getDate() + estCycleLength);
    displayNextPeriodDate = `${estDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} (Est.)`;
  }

  const todaySleep = sleepLogs && sleepLogs.length > 0 ? sleepLogs[0] : null;
  const todayActivity = activityLogs && activityLogs.length > 0 ? activityLogs[0] : null;

  const handleCareAction = (actionKey, label) => {
    setActiveCareActions(prev => ({ ...prev, [actionKey]: true }));
    showToast(`Care action applied: ${label} ✨`, () => {
      setActiveCareActions(prev => ({ ...prev, [actionKey]: false }));
    });
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Greeting Header & Phase Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>{t('dashboard.greeting', 'Good morning')}, {user?.name ? user.name.split(' ')[0] : 'there'}</span>
            <span className="animate-bounce">🌸</span>
          </h2>
          <p className="text-xs font-semibold mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <span>{t('dashboard.cycleDay', 'Cycle Day')} <strong className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>{cycleDay}</strong></span>
            <span>•</span>
            <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
              {homePhaseMode === 'menstrual' ? t('dashboard.menstrualPhase', 'Menstrual Phase 🩸') : t('dashboard.follicularPhase', 'Follicular Phase 🌱')}
            </span>
          </p>
        </div>

        {/* Phase-Adaptive Mode Switcher Pills */}
        <div className="p-1 rounded-2xl flex border shrink-0" style={{ backgroundColor: 'var(--bg-subcard)', borderColor: 'var(--border-card)' }}>
          <button
            onClick={() => setHomePhaseMode('menstrual')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
              homePhaseMode === 'menstrual'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'hover:opacity-100'
            }`}
            style={{ color: homePhaseMode === 'menstrual' ? '#ffffff' : 'var(--text-secondary)' }}
          >
            <span>🩸 Phase 1 (Menstrual)</span>
          </button>
          <button
            onClick={() => setHomePhaseMode('follicular')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 ${
              homePhaseMode === 'follicular'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'hover:opacity-100'
            }`}
            style={{ color: homePhaseMode === 'follicular' ? '#020617' : 'var(--text-secondary)' }}
          >
            <span>⚡ Phase 2 (Follicular)</span>
          </button>
        </div>
      </div>

      {/* ONE-TAP CRAMP SOS ACTION BANNER (Requirement 3A) */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-4 rounded-3xl text-white shadow-xl shadow-rose-500/20 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>One-Tap Pain Relief</span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-white">{t('dashboard.crampSosTitle', 'Period Cramp SOS 🆘')}</h3>
          <p className="text-[11px] text-pink-100 opacity-90 leading-tight">
            {t('dashboard.crampSosSub', '20-min heat pad timer, 4-7-8 calming breathing & fast pain logging')}
          </p>
        </div>

        <button
          onClick={() => setCrampSosModalOpen(true)}
          className="px-4 py-2.5 bg-white hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 text-xs flex items-center gap-1.5 keep-white"
          style={{ backgroundColor: '#ffffff', color: '#be123c' }}
        >
          <span className="font-black" style={{ color: '#be123c' }}>{t('dashboard.openSos', 'Open SOS')}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5px]" style={{ color: '#be123c' }} />
        </button>
      </div>

      {/* PHASE-BASED DAILY ENERGY INSIGHT CARD (Requirement 3B) */}
      <PhaseEnergyCard />

      {/* Active Condition Quick Badges (Requirement 3) */}
      {(trackPcod || trackMigraine) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {trackPcod && (
            <button
              onClick={() => setCurrentView('track')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-102"
              style={{ backgroundColor: 'var(--bg-subcard)', borderColor: 'var(--border-card)', color: 'var(--accent-primary)' }}
            >
              <span>🌸</span>
              <span>PCOD / PCOS Active</span>
            </button>
          )}
          {trackMigraine && (
            <button
              onClick={() => setCurrentView('track')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-102"
              style={{ backgroundColor: 'var(--bg-subcard)', borderColor: 'var(--border-card)', color: '#d97706' }}
            >
              <span>⚡</span>
              <span>Migraine Log Active</span>
            </button>
          )}
        </div>
      )}

      {/* ROTATING EMPOWERMENT QUOTE CARD */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Quote className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{t('dashboard.dailyInspiration', 'Daily Inspiration')}</span>
          </span>
          <button
            onClick={nextQuote}
            className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1 text-[11px] font-semibold"
            title="Show another quote"
            aria-label="New empowerment quote"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('dashboard.newQuote', 'New Quote')}</span>
          </button>
        </div>

        <p className="text-sm font-medium italic leading-relaxed text-slate-800 dark:text-slate-100 font-serif">
          "{currentQuote.quote}"
        </p>

        <div className="text-right text-xs font-bold text-rose-600 dark:text-rose-400">
          — {currentQuote.author}
        </div>
      </div>

      {/* Cycle Overview Banner Card */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        {hasCycleData ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-100 opacity-90">
                  {t('dashboard.cycleOverview', 'Cycle Overview')}
                </span>
                <h3 className={`text-3xl font-extrabold mt-0.5 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>
                  Day {cycleDay}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
                {homePhaseMode === 'menstrual' ? '🩸' : '🌸'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min((cycleDay / (user?.avgCycleLength || 28)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-pink-100 opacity-90">
                <span>{t('dashboard.day1Period', 'Day 1 (Period)')}</span>
                <span>Day {Math.round((user?.avgCycleLength || 28) / 2)} (Ovulation)</span>
                <span>Day {user?.avgCycleLength || 28}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-medium">
              <span>{t('dashboard.nextPeriodExpected', 'Next period expected:')} <strong className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>{displayNextPeriodDate}</strong></span>
              <button
                onClick={() => setCurrentView('cycle')}
                className="px-3.5 py-1.5 bg-white hover:bg-pink-50 font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 keep-white cursor-pointer"
                style={{ backgroundColor: '#ffffff', color: '#be185d' }}
                aria-label="View cycle calendar"
              >
                <span style={{ color: '#be185d' }}>{t('dashboard.viewCalendar', 'View Calendar')}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" style={{ color: '#be185d' }} />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-100 opacity-90">
                  {t('dashboard.cycleOverview', 'Cycle Overview')}
                </span>
                <h3 className="text-2xl font-extrabold mt-0.5 text-white">
                  Welcome to FemCare
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
                🌸
              </div>
            </div>

            <p className="text-xs text-pink-100 leading-relaxed opacity-95">
              No cycles logged yet. Record your period start date to activate personalized cycle day tracking, genuine phase projections, and symptom analytics.
            </p>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setPeriodLogDate(new Date().toISOString().split('T')[0]);
                  setQuickLogModal('period');
                }}
                className="px-4 py-2 bg-white hover:bg-pink-50 font-black rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: '#ffffff', color: '#be123c' }}
              >
                <span style={{ color: '#be123c' }}>+ Log Period Start Date</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" style={{ color: '#be123c' }} />
              </button>
              <button
                onClick={() => setCurrentView('cycle')}
                className="text-xs font-bold text-pink-100 hover:text-white underline cursor-pointer"
              >
                Open Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PHASE-ADAPTIVE DASHBOARD CARDS */}
      {homePhaseMode === 'menstrual' ? (
        /* PHASE 1: MENSTRUAL / LUTEAL PHASE */
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Phase 1 Soothing Care & Pain Relief</span>
            </h3>
            <span className="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full border border-rose-200">
              Instant Perceptual Feedback
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Action 1: Heat Compress Prompt */}
            <button
              onClick={() => handleCareAction('heat', 'Warm Heat Compress')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeCareActions.heat
                  ? 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-300 scale-105 shadow-lg'
                  : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔥</span>
                {activeCareActions.heat && <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />}
              </div>
              <div className={`font-bold text-xs ${activeCareActions.heat ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                Warm Heat Compress
              </div>
              <div className={`text-[10px] mt-0.5 ${activeCareActions.heat ? 'text-rose-100 font-medium' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                Soothe uterine muscle cramps
              </div>
            </button>

            {/* Action 2: Hydration Boost */}
            <button
              onClick={() => {
                addHydrationMl(250);
                handleCareAction('water', '250ml Water Glass');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeCareActions.water
                  ? 'bg-teal-600 text-white border-teal-600 ring-4 ring-teal-300 scale-105 shadow-lg'
                  : 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 hover:border-teal-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💧</span>
                {activeCareActions.water && <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />}
              </div>
              <div className={`font-bold text-xs ${activeCareActions.water ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                Hydration Boost
              </div>
              <div className={`text-[10px] mt-0.5 ${activeCareActions.water ? 'text-teal-100 font-medium' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                +250ml Warm Herbal Hydration
              </div>
            </button>

            {/* Action 3: Pain & Cramp Severity Log */}
            <button
              onClick={() => {
                addSymptom('Abdominal Cramps', 'Pain & Discomfort', 'Moderate');
                handleCareAction('cramp', 'Cramp Severity');
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeCareActions.cramp
                  ? 'bg-purple-600 text-white border-purple-600 ring-4 ring-purple-300 scale-105 shadow-lg'
                  : 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 hover:border-purple-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🩺</span>
                {activeCareActions.cramp && <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />}
              </div>
              <div className={`font-bold text-xs ${activeCareActions.cramp ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                Log Cramp Severity
              </div>
              <div className={`text-[10px] mt-0.5 ${activeCareActions.cramp ? 'text-purple-100 font-medium' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                Record pain level & duration
              </div>
            </button>

            {/* Action 4: Rest & Restorative Prompt */}
            <button
              onClick={() => handleCareAction('rest', 'Rest & Relaxation Mode')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeCareActions.rest
                  ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-300 scale-105 shadow-lg'
                  : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🛋️</span>
                {activeCareActions.rest && <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />}
              </div>
              <div className={`font-bold text-xs ${activeCareActions.rest ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                Rest & Relaxation
              </div>
              <div className={`text-[10px] mt-0.5 ${activeCareActions.rest ? 'text-indigo-100 font-medium' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                30-min nap & restorative breathing
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* PHASE 2: FOLLICULAR / OVULATORY PHASE */
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Phase 2 Energy & Ovulation Window</span>
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700">
              Fertility Window Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Energy Slider Card */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">⚡</span>
                <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">Energy: {selectedEnergy}/10</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Vitality Rating</div>
              <input
                type="range"
                min="1"
                max="10"
                value={selectedEnergy}
                onChange={(e) => {
                  setSelectedEnergy(e.target.value);
                  showToast(`Energy updated: ${e.target.value}/10 ⚡`);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Cervical Mucus Consistency */}
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">💧</span>
                <span className="text-[10px] font-extrabold text-teal-900 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-700">Mucus</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Mucus Type</div>
              <select
                value={selectedMucus}
                onChange={(e) => {
                  setSelectedMucus(e.target.value);
                  showToast(`Logged mucus: ${e.target.value}`);
                }}
                className="w-full text-[11px] p-1.5 rounded-lg border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="Egg White (Fertile)">Egg White (Fertile)</option>
                <option value="Watery">Watery</option>
                <option value="Creamy">Creamy</option>
                <option value="Sticky">Sticky</option>
              </select>
            </div>

            {/* Basal Body Temperature (BBT) Log */}
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-center justify-between">
                <Thermometer className="w-5 h-5 text-rose-500" />
                <span className={`font-mono text-xs font-bold text-rose-800 dark:text-rose-200 ${privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}`}>{bbtValue}°F</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Basal Temp (BBT)</div>
              <button
                onClick={() => {
                  const newBbt = (Number(bbtValue) + 0.1).toFixed(1);
                  setBbtValue(newBbt);
                  showToast(`BBT updated to ${newBbt}°F 🌡️`, () => setBbtValue(97.8));
                }}
                className="w-full py-1.5 bg-rose-600 text-white font-bold rounded-lg text-[10px] hover:bg-rose-700 transition-colors"
              >
                Log Morning BBT
              </button>
            </div>

            {/* Ovulation Peak Insight Card */}
            <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xl">🌸</span>
                <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700">High Fertility</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Ovulation Peak</div>
              <p className="text-[10px] text-slate-700 dark:text-slate-200 font-bold">Predicted in 2 days (Oct 2)</p>
            </div>
          </div>
        </div>
      )}

      {/* QUICK LOGGING MODALS */}
      <Modal
        isOpen={quickLogModal === 'period'}
        onClose={() => setQuickLogModal(null)}
        title="Log Period Flow"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Period Date
            </label>
            <input
              type="date"
              value={periodLogDate}
              onChange={(e) => setPeriodLogDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Record flow intensity for selected date.</p>
          <div className="grid grid-cols-3 gap-3">
            {['Light', 'Medium', 'Heavy'].map((flow) => (
              <button
                key={flow}
                onClick={() => setSelectedFlow(flow)}
                className={`py-3.5 px-3 rounded-xl border text-center transition-all ${
                  selectedFlow === flow
                    ? 'border-pink-500 bg-pink-50 text-pink-900 dark:bg-pink-950/80 dark:text-pink-100 font-extrabold ring-2 ring-pink-400/40'
                    : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="text-xl mb-1">{flow === 'Light' ? '💧' : '🩸'}</div>
                <div className="text-xs font-bold">{flow}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              addPeriodEntryDetailed(periodLogDate, selectedFlow);
              setQuickLogModal(null);
            }}
            className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
          >
            Save Period Log
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={quickLogModal === 'mood'}
        onClose={() => setQuickLogModal(null)}
        title="How are you feeling today?"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'great', label: 'Great', emoji: '😊' },
            { id: 'good', label: 'Good', emoji: '🙂' },
            { id: 'okay', label: 'Okay', emoji: '😐' },
            { id: 'low', label: 'Low', emoji: '😔' },
            { id: 'irritated', label: 'Irritated', emoji: '😣' },
            { id: 'stressed', label: 'Stressed', emoji: '😫' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                addMoodLog(m);
                setQuickLogModal(null);
              }}
              className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-center bg-white dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.label}</div>
            </button>
          ))}
        </div>
      </Modal>

    </div>
  );
};
