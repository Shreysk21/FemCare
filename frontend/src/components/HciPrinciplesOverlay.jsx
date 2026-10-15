import React from 'react';
import { useApp } from '../context/AppContext';
import { X, BookOpen, Check, HelpCircle } from 'lucide-react';

export const HciPrinciplesOverlay = () => {
  const { hciOverlayOpen, setHciOverlayOpen, currentView } = useApp();

  if (!hciOverlayOpen) return null;

  const getPrinciplesForView = (view) => {
    switch (view) {
      case 'home':
        return [
          { law: "Fitts' Law", description: "Quick Log buttons feature extra-large touch areas (>48px) placed prominently near the center for instant 1-tap interaction." },
          { law: "Hick-Hyman Law", description: "Dashboard displays only 6 core wellness actions initially. Progressive disclosure hides deep analytics until requested." },
          { law: "Nielsen #1 (System Status)", description: "Cycle Day 14 badge and next period countdown clearly display current physiological phase." },
          { law: "Shneiderman #2 (Shortcuts)", description: "Returning users can log period, mood, water, or sleep in 1 tap without navigating submenus." }
        ];
      case 'cycle':
        return [
          { law: "Norman (Signifiers & Affordances)", description: "Calendar flow days use explicit text badges ('Heavy', 'Medium') alongside icons and colors to ensure accessibility without relying only on color." },
          { law: "Shneiderman #6 (Easy Reversal)", description: "Deleting or editing a period log provides instant undo toasts and explicit confirmation modals to prevent accidental deletion." },
          { law: "Nielsen #5 (Error Prevention)", description: "Period end date validation prevents selecting an end date prior to the start date." }
        ];
      case 'track':
        return [
          { law: "Hick-Hyman Law", description: "Symptoms are grouped into 3 expandable categories (Pain, Digestive, Energy) reducing decision time compared to showing 30 symptoms simultaneously." },
          { law: "Nielsen #6 (Recognition over Recall)", description: "Visual emoji icons and categorized symptom chips prompt user memory instead of requiring typed input." },
          { law: "Shneiderman #1 (Consistency)", description: "All loggers (Water, Mood, Sleep, Activity, Medication) share standardized input controls and feedback toasts." }
        ];
      case 'insights':
        return [
          { law: "Nielsen #8 (Minimalist Design)", description: "Charts present actionable answers (e.g. sleep duration vs mood) without cluttering screen with raw data dumps." },
          { law: "Norman (Conceptual Model)", description: "Unusual pattern alerts clearly state 'General wellness info — not a diagnosis' preserving an accurate user mental model." }
        ];
      case 'ai':
        return [
          { law: "Shneiderman #7 (Internal Locus of Control)", description: "Suggested prompts let users guide the conversation, while clear disclaimer footers preserve transparency." }
        ];
      default:
        return [
          { law: "Accessibility & Usability", description: "Support for Dark Mode, High-Contrast Mode, text scaling, keyboard focus rings, and screen-reader labels across all components." }
        ];
    }
  };

  const activePrinciples = getPrinciplesForView(currentView);

  return (
    <div className="fixed bottom-16 right-4 z-50 max-w-sm w-96 bg-purple-950 text-white rounded-2xl shadow-2xl border border-purple-500/40 p-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-purple-800/60 pb-3 mb-3">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>HCI Analysis: <span className="capitalize text-white">{currentView} Screen</span></span>
        </div>
        <button
          onClick={() => setHciOverlayOpen(false)}
          className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900"
          aria-label="Close HCI Overlay"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
        {activePrinciples.map((item, idx) => (
          <div key={idx} className="bg-purple-900/50 p-2.5 rounded-xl border border-purple-700/50">
            <div className="font-bold text-purple-200 mb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item.law}</span>
            </div>
            <p className="text-purple-100/90 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-purple-800/60 text-[10px] text-purple-300 text-center">
        Demonstrating Nielsen, Shneiderman, Norman, Fitts & Hick-Hyman HCI Laws
      </div>
    </div>
  );
};
