import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Flame, Timer, HeartPulse, PhoneCall, Play, Pause, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

export const CrampSosModal = () => {
  const {
    crampSosModalOpen,
    setCrampSosModalOpen,
    addSymptom,
    setCurrentView,
    showToast
  } = useApp();

  const [sosPainLevel, setSosPainLevel] = useState('Moderate');
  
  // 20-min Heat Pad Timer State
  const [timerSeconds, setTimerSeconds] = useState(1200); // 20 mins = 1200s
  const [timerActive, setTimerActive] = useState(false);

  // 4-7-8 Breathing Guide State
  const [breathingPhase, setBreathingPhase] = useState('Inhale (4s)'); // Inhale (4s), Hold (7s), Exhale (8s)
  const [breathCount, setBreathCount] = useState(4);
  const [breathingActive, setBreathingActive] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      showToast("Heat Pad 20-min Timer Complete! 🔥 Rest well.", null, "✨");
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, showToast]);

  // Breathing Guide Loop Effect
  useEffect(() => {
    let breathInterval = null;
    if (breathingActive) {
      breathInterval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev.startsWith('Inhale')) return 'Hold (7s)';
          if (prev.startsWith('Hold')) return 'Exhale (8s)';
          return 'Inhale (4s)';
        });
      }, 5000);
    }
    return () => clearInterval(breathInterval);
  }, [breathingActive]);

  if (!crampSosModalOpen) return null;

  const formatTimerTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainderSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSec.toString().padStart(2, '0')}`;
  };

  const handlePainLog = (level) => {
    setSosPainLevel(level);
    addSymptom('Abdominal Cramps', 'Pain & Discomfort', level, 'Logged via Cramp SOS Action');
  };

  return (
    <Modal
      isOpen={crampSosModalOpen}
      onClose={() => setCrampSosModalOpen(false)}
      title="Cramp SOS & Pain Relief Guide 🆘"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-slate-800 dark:text-slate-100 text-xs">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Instant Comfort Protocol</span>
            </span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
              Low-Cognitive Load Mode
            </span>
          </div>
          <h3 className="text-base font-extrabold">Gentle Pain & Cramp Relief</h3>
          <p className="text-[11px] text-pink-100 opacity-90 leading-tight">
            Follow the 1-tap steps below to ease muscle contractions and restore calm.
          </p>
        </div>

        {/* 1. Pain Intensity Fast Selector */}
        <div className="space-y-2">
          <label className="font-bold text-slate-800 dark:text-slate-100 text-xs flex justify-between">
            <span>1. Log Pain Intensity Right Now:</span>
            <span className="text-pink-600 dark:text-pink-400 font-extrabold">{sosPainLevel} Pain</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Mild', label: 'Mild (1-3)', icon: '🟢', color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100' },
              { id: 'Moderate', label: 'Moderate (4-6)', icon: '🟡', color: 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100' },
              { id: 'Severe', label: 'Severe (7-10)', icon: '🔴', color: 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/80 text-rose-950 dark:text-rose-100' }
            ].map((p) => {
              const isSelected = sosPainLevel === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePainLog(p.id)}
                  className={`p-3 rounded-xl border font-black text-center transition-all ${p.color} ${
                    isSelected ? 'ring-4 ring-pink-500 scale-105 shadow-md' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="text-base mb-0.5">{p.icon}</div>
                  <div className="text-xs">{p.id}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 20-Min Heat Pad Timer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
              <Timer className="w-4 h-4 text-amber-500" />
              <span>20-Min Gentle Heat Pad Timer</span>
            </span>
            <span className="font-mono text-base font-extrabold text-pink-600 dark:text-pink-400">
              {formatTimerTime(timerSeconds)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${((1200 - timerSeconds) / 1200) * 100}%` }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors shadow-xs"
            >
              {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{timerActive ? 'Pause Timer' : 'Start Heat Pad (20m)'}</span>
            </button>
            <button
              onClick={() => {
                setTimerActive(false);
                setTimerSeconds(1200);
              }}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. 4-7-8 Calming Breathing Guide */}
        <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-900 space-y-3 text-center">
          <div className="flex justify-between items-center text-left">
            <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 text-xs">
              <HeartPulse className="w-4 h-4 text-purple-500" />
              <span>4-7-8 Uterine Muscle Relaxation Breathing</span>
            </span>
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="text-[10px] font-bold px-2.5 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {breathingActive ? 'Stop Guide' : 'Start Breathing'}
            </button>
          </div>

          <div className="py-3 flex flex-col items-center justify-center space-y-2">
            <div className={`w-16 h-16 rounded-full border-4 border-purple-400 bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl transition-all duration-1000 ${
              breathingActive ? 'scale-125 ring-8 ring-purple-300/50 animate-pulse' : ''
            }`}>
              🫁
            </div>
            <div className="font-extrabold text-purple-950 dark:text-purple-100 text-xs">
              {breathingActive ? breathingPhase : 'Tap "Start Breathing" to align pace'}
            </div>
            <p className="text-[10px] text-purple-700 dark:text-purple-300 max-w-xs font-medium">
              Inhale deeply for 4 seconds ➔ Hold for 7 seconds ➔ Slowly exhale for 8 seconds.
            </p>
          </div>
        </div>

        {/* 4. Quick Action: Call Doctor / Saved Clinic */}
        <button
          onClick={() => {
            setCrampSosModalOpen(false);
            setCurrentView('care');
          }}
          className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-xs"
        >
          <PhoneCall className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Connect with Nearby Healthcare Clinic</span>
        </button>

      </div>
    </Modal>
  );
};
