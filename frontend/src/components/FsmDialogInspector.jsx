import React from 'react';
import { useApp } from '../context/AppContext';
import { Network, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Clock } from 'lucide-react';

export const FsmDialogInspector = () => {
  const {
    fsmState,
    fsmHistory,
    fsmPayload,
    fsmInspectorOpen,
    setFsmInspectorOpen,
    transitionFSM,
    setFsmLoggingModalOpen
  } = useApp();

  const statesConfig = [
    { id: 'IDLE', label: '1. IDLE', desc: 'Awaiting trigger' },
    { id: 'PROMPT_SYMPTOM', label: '2. PROMPT_SYMPTOM', desc: 'Select Flow / Symptom' },
    { id: 'SELECT_SEVERITY', label: '3. SELECT_SEVERITY', desc: 'Set Intensity / Severity' },
    { id: 'NOTE_INPUT_OPTIONAL', label: '4. NOTE_INPUT_OPTIONAL', desc: 'Optional Context Note' },
    { id: 'SAVING', label: '5. SAVING', desc: 'Simulating Local Sync' },
    { id: 'SYNC_CONFIRMED', label: '6. SYNC_CONFIRMED', desc: 'Data Persisted' },
    { id: 'ERROR_FALLBACK', label: '7. ERROR_FALLBACK', desc: 'Fallback / Retry' }
  ];

  return (
    <div className="fixed bottom-14 left-4 z-40 max-w-sm sm:max-w-md w-full animate-fade-in">
      {/* Drawer Toggle Header */}
      <button
        onClick={() => setFsmInspectorOpen(!fsmInspectorOpen)}
        className="w-full bg-slate-900 dark:bg-slate-950 text-white px-4 py-2.5 rounded-t-2xl shadow-xl border-t border-x border-pink-500/40 flex items-center justify-between text-xs font-bold transition-all hover:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-pink-400 animate-pulse" />
          <span>Unit 6 FSM Dialog Inspector</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-600/80 text-white font-mono uppercase">
            State: {fsmState}
          </span>
        </div>
        {fsmInspectorOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Expanded FSM Graph & Trace Panel */}
      {fsmInspectorOpen && (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-x border-b border-pink-500/40 rounded-b-2xl p-4 shadow-2xl space-y-4 text-xs max-h-96 overflow-y-auto">
          
          {/* Controls Bar */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[11px] text-slate-400 font-semibold">
              Finite State Machine Graph (Interactive Formal Dialog)
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFsmLoggingModalOpen(true)}
                className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold rounded-lg transition-colors"
              >
                Launch Dialog
              </button>
              <button
                onClick={() => transitionFSM('ERROR_FALLBACK', 'SIMULATE_FAILURE')}
                className="px-2 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[10px] font-bold rounded-lg border border-rose-700"
                title="Test Error Fallback State"
              >
                Simulate Error
              </button>
            </div>
          </div>

          {/* Visual State Link Diagram */}
          <div className="grid grid-cols-2 gap-2">
            {statesConfig.map((st) => {
              const isActive = fsmState === st.id;
              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-xl border transition-all text-left flex items-start gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-300 text-white shadow-lg ring-2 ring-pink-400/80 scale-[1.02]'
                      : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="mt-0.5">
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-white animate-bounce shrink-0" />
                    ) : st.id === 'ERROR_FALLBACK' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="font-mono font-bold text-[11px]">{st.label}</div>
                    <div className="text-[9px] opacity-80 leading-tight mt-0.5">{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Payload Information */}
          {Object.keys(fsmPayload).length > 0 && (
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-pink-300">
              <span className="text-slate-400 uppercase font-sans font-bold block mb-1">State Payload Data:</span>
              <pre className="whitespace-pre-wrap">{JSON.stringify(fsmPayload, null, 2)}</pre>
            </div>
          )}

          {/* Real-time Transition History Audit Trail */}
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-pink-400" />
              <span>State Transition History Trail</span>
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {fsmHistory.slice(-5).reverse().map((h, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-800/40 p-1.5 rounded">
                  <div className="flex items-center gap-1">
                    <span className="text-pink-400 font-bold">{h.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-emerald-400 font-bold">{h.to}</span>
                  </div>
                  <div className="text-slate-500 text-[9px]">
                    [{h.event}] @ {h.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
