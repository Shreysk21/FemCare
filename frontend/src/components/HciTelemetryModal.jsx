import React from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Activity, Zap, Clock, AlertCircle, BarChart3, Layers, Calculator, RefreshCw } from 'lucide-react';

export const HciTelemetryModal = () => {
  const {
    telemetryModalOpen,
    setTelemetryModalOpen,
    telemetryStats,
    symptomLoggingVariant,
    setSymptomLoggingVariant,
    resetCurrentTelemetrySession
  } = useApp();

  const vA = telemetryStats.variantA;
  const vB = telemetryStats.variantB;
  const curr = telemetryStats.currentSession;

  // Theoretical Calculations
  // Hick-Hyman Law: T = b * log2(n + 1), assuming b = 180 ms
  // Variant A: 24 unorganized symptoms (n = 24) -> T = 180 * log2(25) = 180 * 4.644 = ~836 ms cognitive visual selection
  // Variant B: 3 categories (n = 3) + 3 top chips (n = 3) -> T = 180 * log2(4) + 180 * log2(4) = 360 + 360 = ~720 ms total chunked search
  const b = 180;
  const hickHymanA = Math.round(b * Math.log2(25));
  const hickHymanB = Math.round(b * Math.log2(4) + b * Math.log2(4));

  // KLM (Keystroke-Level Model) predicted time:
  // Variant A: Point (P = 1100ms) + Mental Search (M = 1350ms) + Click (K = 200ms) + Scroll (H = 400ms) x 2.5 average steps = ~7,625 ms
  // Variant B: Point (P = 1100ms) + Mental Search (M = 1350ms) + 1-Tap Click (K = 200ms) = ~2,650 ms
  const klmA = 7625;
  const klmB = 2650;

  return (
    <Modal
      isOpen={telemetryModalOpen}
      onClose={() => setTelemetryModalOpen(false)}
      title="HCI Empirical Evaluation & Telemetry"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-slate-800 dark:text-slate-100 text-xs">
        
        {/* Header Summary Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-2xl border border-purple-700/60 shadow-md flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-purple-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Unit 4 Empirical Evaluation & Metrics</span>
            </div>
            <h3 className="text-base font-extrabold mt-0.5">
              A/B Usability Benchmark Dashboard
            </h3>
            <p className="text-[11px] text-purple-200/90 mt-0.5">
              Comparing Baseline Variant A (Flat 24 Grid) vs. HCI-Optimized Variant B (Hick-Hyman Chunking)
            </p>
          </div>
          <button
            onClick={resetCurrentTelemetrySession}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-purple-200 transition-colors flex items-center gap-1 shrink-0"
            title="Reset current telemetry counters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Current Active Variant & Session Status */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-300">Active Symptom Logging Condition:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSymptomLoggingVariant('variantA')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  symptomLoggingVariant === 'variantA'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Variant A (Flat 24 Grid)
              </button>
              <button
                onClick={() => setSymptomLoggingVariant('variantB')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  symptomLoggingVariant === 'variantB'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Variant B (Hick-Hyman Chunked)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Time to 1st Tap (TTFI)</div>
              <div className="text-lg font-black text-pink-600 dark:text-pink-400 mt-0.5">
                {curr.firstInteractionTime ? `${curr.firstInteractionTime - curr.startTime} ms` : 'Awaiting tap...'}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Task Completion Time</div>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                {curr.completed ? `${curr.completionTimeMs} ms` : 'In progress...'}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Session Error Taps</div>
              <div className="text-lg font-black text-rose-500 mt-0.5">
                {curr.errors} {curr.errors === 0 ? '✓' : 'mis-clicks'}
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Empirical A/B Data Comparison Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Empirical Usability Metrics Comparison</span>
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Usability Metric</th>
                  <th className="p-2.5 text-rose-600 dark:text-rose-400">Variant A (Flat 24)</th>
                  <th className="p-2.5 text-emerald-600 dark:text-emerald-400">Variant B (Hick-Hyman)</th>
                  <th className="p-2.5 text-purple-600 dark:text-purple-300">Delta / Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-2.5 font-semibold">Avg. Completion Time (ms)</td>
                  <td className="p-2.5 font-mono">{vA.avgCompletionMs} ms</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-600">{vB.avgCompletionMs} ms</td>
                  <td className="p-2.5 font-bold text-emerald-600">
                    -{Math.round(((vA.avgCompletionMs - vB.avgCompletionMs) / vA.avgCompletionMs) * 100)}% faster ⚡
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Time to First Interaction (TTFI)</td>
                  <td className="p-2.5 font-mono">{vA.avgTTFIMs} ms</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-600">{vB.avgTTFIMs} ms</td>
                  <td className="p-2.5 font-bold text-emerald-600">
                    -{Math.round(((vA.avgTTFIMs - vB.avgTTFIMs) / vA.avgTTFIMs) * 100)}% cognitive load
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Total Error / Mis-clicks</td>
                  <td className="p-2.5 font-mono">{vA.totalErrors} errors</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-600">{vB.totalErrors} errors</td>
                  <td className="p-2.5 font-bold text-emerald-600">
                    {vA.totalErrors > vB.totalErrors ? `${vA.totalErrors - vB.totalErrors} fewer errors` : 'Clean execution'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Total Benchmark Sessions</td>
                  <td className="p-2.5 font-mono">{vA.sessions} tests</td>
                  <td className="p-2.5 font-mono font-bold">{vB.sessions} tests</td>
                  <td className="p-2.5 font-semibold text-slate-500">Live Telemetry Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Theoretical Model Calculations (Hick-Hyman & KLM) */}
        <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 space-y-3">
          <h4 className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 text-xs">
            <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Theoretical Predicted Task Times (Unit 3 Laws)</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Hick-Hyman */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900 space-y-1">
              <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
                <span>Hick-Hyman Law</span>
                <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300">T = b log₂(n+1)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Variant A (n=24): <span className="font-mono font-bold text-rose-600">{hickHymanA} ms</span>
                <br />
                Variant B (Chunked n=3): <span className="font-mono font-bold text-emerald-600">{hickHymanB} ms</span>
              </p>
              <div className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold pt-0.5">
                Chunking 24 symptoms into 3 categories reduces decision time by {Math.round(((hickHymanA - hickHymanB) / hickHymanA) * 100)}%!
              </div>
            </div>

            {/* KLM Model */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900 space-y-1">
              <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
                <span>KLM GOMS Model</span>
                <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300">T = T_K + T_P + T_M</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Variant A (Scroll + Multi-tap): <span className="font-mono font-bold text-rose-600">{klmA} ms</span>
                <br />
                Variant B (1-Tap Chip): <span className="font-mono font-bold text-emerald-600">{klmB} ms</span>
              </p>
              <div className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold pt-0.5">
                KLM predicts {Math.round(((klmA - klmB) / klmA) * 100)}% reduction in motor-cognitive physical steps!
              </div>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
