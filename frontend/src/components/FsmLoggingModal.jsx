import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Check, ArrowRight, RotateCcw, AlertTriangle, Sparkles, Send, ShieldCheck } from 'lucide-react';

export const FsmLoggingModal = () => {
  const {
    fsmLoggingModalOpen,
    setFsmLoggingModalOpen,
    fsmState,
    transitionFSM,
    addPeriodEntryDetailed,
    addSymptom,
    setFsmInspectorOpen
  } = useApp();

  const [selectedFlow, setSelectedFlow] = useState('Medium');
  const [selectedSeverity, setSelectedSeverity] = useState('Moderate');
  const [notes, setNotes] = useState('');

  if (!fsmLoggingModalOpen) return null;

  const handleStart = (flowType) => {
    setSelectedFlow(flowType);
    transitionFSM('SELECT_SEVERITY', 'SELECT_FLOW', { flow: flowType });
  };

  const handleSeveritySelect = (sev) => {
    setSelectedSeverity(sev);
    transitionFSM('NOTE_INPUT_OPTIONAL', 'SET_SEVERITY', { severity: sev });
  };

  const handleSaveSubmit = () => {
    transitionFSM('SAVING', 'SUBMIT_DATA', { notes });

    // Simulate network / async state persistence
    setTimeout(() => {
      addPeriodEntryDetailed(new Date().toISOString().split('T')[0], selectedFlow, null, [
        { name: 'Abdominal Cramps', category: 'Pain & Discomfort' }
      ]);
      transitionFSM('SYNC_CONFIRMED', 'SYNC_SUCCESS', { status: '200 OK' });
    }, 1200);
  };

  const handleReset = () => {
    setSelectedFlow('Medium');
    setSelectedSeverity('Moderate');
    setNotes('');
    transitionFSM('IDLE', 'RESET_DIALOG');
    setFsmLoggingModalOpen(false);
  };

  return (
    <Modal
      isOpen={fsmLoggingModalOpen}
      onClose={() => setFsmLoggingModalOpen(false)}
      title="Interactive FSM Period & Symptom Logger"
    >
      <div className="space-y-5 text-xs text-slate-800 dark:text-slate-100">
        
        {/* FSM Inspector Quick Status Bar */}
        <div className="bg-pink-50 dark:bg-pink-950/40 p-3 rounded-xl border border-pink-200 dark:border-pink-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <span className="font-bold text-pink-900 dark:text-pink-200">
              Active FSM State: <strong className="font-mono underline">{fsmState}</strong>
            </span>
          </div>
          <button
            onClick={() => setFsmInspectorOpen(true)}
            className="text-[10px] text-pink-700 dark:text-pink-300 font-bold underline hover:text-pink-900"
          >
            Open Inspector Drawer ↗
          </button>
        </div>

        {/* STATE 1: IDLE / PROMPT SYMPTOM */}
        {(fsmState === 'IDLE' || fsmState === 'PROMPT_SYMPTOM') && (
          <div className="space-y-3 animate-fade-in">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Step 1: Select Today's Menstrual Flow Level:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Light', label: '💧 Light Flow', color: 'border-pink-200 bg-pink-50 text-pink-800' },
                { id: 'Medium', label: '🩸 Medium Flow', color: 'border-rose-300 bg-rose-50 text-rose-800' },
                { id: 'Heavy', label: '🩸 Heavy Flow', color: 'border-purple-300 bg-purple-50 text-purple-800' }
              ].map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => handleStart(flow.id)}
                  className={`p-4 rounded-2xl border ${flow.color} hover:scale-105 transition-all text-center font-bold text-xs shadow-xs focus:ring-2 focus:ring-pink-500`}
                >
                  <div className="text-xl mb-1">{flow.id === 'Light' ? '💧' : '🩸'}</div>
                  <div>{flow.id}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STATE 2: SELECT SEVERITY */}
        {fsmState === 'SELECT_SEVERITY' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Step 2: Select Associated Cramp / Discomfort Intensity:
              </p>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-100 dark:bg-pink-900/60 px-2 py-0.5 rounded-full">
                Flow: {selectedFlow}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Mild', label: 'Mild (1-3)', icon: '🟢' },
                { id: 'Moderate', label: 'Moderate (4-6)', icon: '🟡' },
                { id: 'Severe', label: 'Severe (7-10)', icon: '🔴' }
              ].map((sev) => (
                <button
                  key={sev.id}
                  onClick={() => handleSeveritySelect(sev.id)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-center font-bold transition-all"
                >
                  <div className="text-lg mb-1">{sev.icon}</div>
                  <div>{sev.id}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STATE 3: NOTE INPUT OPTIONAL */}
        {fsmState === 'NOTE_INPUT_OPTIONAL' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between font-medium">
              <span>Selected: <strong>{selectedFlow} Flow</strong></span>
              <span>Severity: <strong>{selectedSeverity}</strong></span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Step 3: Optional Daily Notes / Context:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Took warm tea, rested in afternoon..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleSaveSubmit}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Submit & Sync Data</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STATE 4: SAVING (SIMULATED ASYNC SYNC) */}
        {fsmState === 'SAVING' && (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="font-bold text-slate-800 dark:text-slate-100">
              State: SAVING ➔ Validating & Persisting Entry...
            </div>
            <p className="text-[11px] text-slate-500">
              Executing state transition payload commit to application store
            </p>
          </div>
        )}

        {/* STATE 5: SYNC CONFIRMED */}
        {fsmState === 'SYNC_CONFIRMED' && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">
                FSM State: SYNC_CONFIRMED ✓
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Entry successfully logged: {selectedFlow} Flow ({selectedSeverity} Severity)
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors"
            >
              Close & Reset Dialog
            </button>
          </div>
        )}

        {/* STATE 6: ERROR FALLBACK */}
        {fsmState === 'ERROR_FALLBACK' && (
          <div className="py-6 text-center space-y-4 animate-fade-in bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto animate-bounce" />
            <div>
              <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-300">
                FSM State: ERROR_FALLBACK
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                Demonstrating error recovery state formalism in Unit 6 dialog chart.
              </p>
            </div>

            <button
              onClick={() => transitionFSM('PROMPT_SYMPTOM', 'RETRY')}
              className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-md hover:bg-rose-700 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Transition</span>
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
};
