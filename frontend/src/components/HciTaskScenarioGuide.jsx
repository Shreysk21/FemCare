import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from 'lucide-react';

export const HciTaskScenarioGuide = () => {
  const { hciTaskGuideOpen, setHciTaskGuideOpen, tasks, completeTask, setCurrentView } = useApp();

  if (!hciTaskGuideOpen) return null;

  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-y-auto animate-fade-in flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>HCI Evaluation Tasks</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              10 Interactive Usability Test Scenarios
            </p>
          </div>
          <button
            onClick={() => setHciTaskGuideOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close HCI Task Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Evaluation Progress</span>
            <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task Scenarios List */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-2 ${
                task.done
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <button
                  onClick={() => completeTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                  title="Toggle task completion"
                >
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-900" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>Task {task.id}:</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">[{task.category}]</span>
                  </div>
                  <p className="mt-0.5 font-medium leading-relaxed">{task.title}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentView(task.shortcutView);
                }}
                className="shrink-0 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-semibold text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-slate-600 flex items-center gap-1 transition-colors"
                title={`Go to ${task.shortcutView}`}
              >
                <span>Go</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
        <button
          onClick={() => setHciTaskGuideOpen(false)}
          className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
        >
          Close Task Guide
        </button>
      </div>
    </div>
  );
};
