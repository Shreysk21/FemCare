import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SYMPTOM_CATEGORIES,
  MOOD_OPTIONS
} from '../data/mockData';
import {
  Activity as ActivityIcon,
  Droplets,
  Moon,
  Footprints,
  Pill,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const TrackView = () => {
  const {
    symptomLogs,
    addSymptom,
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
    showToast
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('symptoms'); // symptoms, mood, sleep, water, food, activity, meds
  const [expandedSymptomCat, setExpandedSymptomCat] = useState('pain');

  // Severity Selector State per symptom
  const [selectedSeverityMap, setSelectedSeverityMap] = useState({
    'Abdominal Cramps': 'Moderate',
    'Bloating': 'Mild',
    'Fatigue': 'Moderate'
  });

  // Modal States
  const [customSymptomModal, setCustomSymptomModal] = useState(false);
  const [customSymptomName, setCustomSymptomName] = useState('');
  const [customSeverity, setCustomSeverity] = useState('Moderate');

  const [editSymptomData, setEditSymptomData] = useState(null);

  const [medModalOpen, setMedModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 tablet');
  const [medTime, setMedTime] = useState('08:00 AM');

  const [sleepHours, setSleepHours] = useState(7);
  const [sleepMins, setSleepMins] = useState(30);
  const [sleepQuality, setSleepQuality] = useState('Good');

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Daily Wellness Trackers</span>
          <span className="text-xl">📊</span>
        </h2>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
          Record symptoms, mood, sleep, hydration, activity & medication
        </p>
      </div>

      {/* ONE-TAP CRAMP SOS ACTION BANNER (Requirement 3A) */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-4 rounded-3xl text-white shadow-xl shadow-rose-500/20 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Instant Comfort Protocol</span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight">Cramp SOS & Pain Relief 🆘</h3>
          <p className="text-[11px] text-pink-100 opacity-90 leading-tight">
            20-min heat pad timer, 4-7-8 calming breathing & fast pain logging
          </p>
        </div>

        <button
          onClick={() => setCrampSosModalOpen(true)}
          className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 text-xs flex items-center gap-1.5"
        >
          <span>Open SOS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Categorized Pill Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'symptoms', label: '🩺 Symptoms' },
          { id: 'mood', label: '😊 Mood' },
          { id: 'water', label: '💧 Hydration' },
          { id: 'sleep', label: '😴 Sleep' },
          { id: 'meds', label: '💊 Medication' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              activeCategory === tab.id
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CATEGORY 1: SYMPTOMS */}
      {activeCategory === 'symptoms' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Pre-filtered Top 3 Frequent Chips */}
          <div className="bg-purple-50/80 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-900 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-extrabold text-purple-950 dark:text-purple-100 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Top 3 Frequent Symptoms (Fast Chips)</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Abdominal Cramps', icon: '🩺', cat: 'Pain & Discomfort' },
                { name: 'Bloating', icon: '🎈', cat: 'Digestive' },
                { name: 'Fatigue', icon: '😴', cat: 'Mood & Energy' }
              ].map((chip) => {
                const activeSev = selectedSeverityMap[chip.name] || 'Moderate';
                return (
                  <div key={chip.name} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2 text-center shadow-xs">
                    <div className="text-xl">{chip.icon}</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{chip.name}</div>
                    
                    {/* Inline Severity Selector */}
                    <div className="flex justify-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[9px] font-bold">
                      {['Mild', 'Mod', 'Sev'].map((sev) => {
                        const fullSev = sev === 'Mod' ? 'Moderate' : sev === 'Sev' ? 'Severe' : 'Mild';
                        const isSel = activeSev === fullSev;
                        return (
                          <button
                            key={sev}
                            onClick={() => {
                              setSelectedSeverityMap(prev => ({ ...prev, [chip.name]: fullSev }));
                              addSymptom(chip.name, chip.cat, fullSev);
                            }}
                            className={`px-1.5 py-1 rounded transition-all ${
                              isSel ? 'bg-pink-600 text-white font-black shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            {sev}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grouped Accordion Categories */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 dark:text-slate-100">
              <span>Grouped Symptom Categories</span>
              <button
                onClick={() => setCustomSymptomModal(true)}
                className="text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Symptom</span>
              </button>
            </div>

            {SYMPTOM_CATEGORIES.map((cat) => {
              const isExpanded = expandedSymptomCat === cat.id;
              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setExpandedSymptomCat(isExpanded ? null : cat.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
                        {cat.symptoms.length} items
                      </span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2">
                      {cat.symptoms.map((sym) => (
                        <button
                          key={sym.id}
                          onClick={() => addSymptom(sym.label, cat.name, 'Moderate')}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-pink-50 dark:hover:bg-pink-950/50 text-left transition-colors flex items-center gap-2.5"
                        >
                          <span className="text-xl">{sym.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{sym.label}</div>
                            <div className="text-[10px] text-pink-600 dark:text-pink-400 font-extrabold">Tap to log</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Logged Symptoms List with High-Contrast Typography & Privacy Shield */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Logged Symptoms Today ({symptomLogs.length})
            </h3>
            {symptomLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className={privacyShield ? 'filter blur-xs hover:blur-none transition-all' : ''}>{log.symptomName}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-200 border border-rose-200">
                      {log.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    Logged at {log.timeLogged} {log.notes && `• ${log.notes}`}
                  </div>
                </div>

                <button
                  onClick={() => deleteSymptom(log.id)}
                  className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-800 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  aria-label="Delete symptom log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* CATEGORY 2: MOOD */}
      {activeCategory === 'mood' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              How are you feeling right now?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => addMoodLog(m)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-center transition-all"
                >
                  <div className="text-3xl mb-1">{m.emoji}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: HYDRATION */}
      {activeCategory === 'water' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daily Hydration Tracker</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">Target: 2,000 ml per day</p>
              </div>
              <div className="text-2xl font-black text-teal-700 dark:text-teal-300">
                {hydration.currentMl} / {hydration.targetMl} ml
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((hydration.currentMl / hydration.targetMl) * 100, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => addHydrationMl(250)}
                className="py-3 px-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 font-extrabold rounded-xl text-center hover:bg-teal-100"
              >
                +250 ml (Glass)
              </button>
              <button
                onClick={() => addHydrationMl(500)}
                className="py-3 px-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 font-extrabold rounded-xl text-center hover:bg-teal-100"
              >
                +500 ml (Bottle)
              </button>
              <button
                onClick={() => addHydrationMl(750)}
                className="py-3 px-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 font-extrabold rounded-xl text-center hover:bg-teal-100"
              >
                +750 ml (Flask)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SYMPTOM MODAL */}
      <Modal
        isOpen={customSymptomModal}
        onClose={() => setCustomSymptomModal(false)}
        title="Add Custom Symptom"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1">Symptom Name</label>
            <input
              type="text"
              value={customSymptomName}
              onChange={(e) => setCustomSymptomName(e.target.value)}
              placeholder="e.g. Back stiffness..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>
          <button
            onClick={() => {
              if (customSymptomName) {
                addSymptom(customSymptomName, 'Custom', customSeverity);
                setCustomSymptomName('');
                setCustomSymptomModal(false);
              }
            }}
            className="w-full py-3 bg-pink-600 text-white font-bold rounded-xl"
          >
            Save Custom Symptom
          </button>
        </div>
      </Modal>

    </div>
  );
};
