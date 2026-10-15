import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toast, handleUndo } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 animate-fade-in">
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-slate-700/50 dark:border-slate-300">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <span className="text-base">{toast.icon || '✓'}</span>
          <span>{toast.message}</span>
        </div>
        {toast.undoAction && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-pink-400"
            aria-label="Undo action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        )}
      </div>
    </div>
  );
};
