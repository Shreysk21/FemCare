import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AI_SUGGESTED_QUESTIONS } from '../data/mockData';
import { Bot, Send, Sparkles, Shield, User, CornerDownLeft } from 'lucide-react';

export const AiAssistantView = () => {
  const { user } = useApp();

  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      sender: 'ai',
      text: `Hi ${user.name.split(' ')[0]}! 🌸 I am your FemCare Wellness Assistant. I can help answer general questions about cycle tracking, symptoms, sleep, hydration, and wellness patterns.\n\nHow can I support you today?`
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI thinking and typing response
    setTimeout(() => {
      let aiResponseText = "FemCare Assistant provides general wellness guidelines. For persistent discomfort, consult a physician.";
      const lower = textToSend.toLowerCase();

      if (lower.includes('cramps') || lower.includes('pain')) {
        aiResponseText = "Abdominal cramps during your cycle are primarily caused by prostaglandins triggering uterine contractions. Gentle heat pads, light stretching, staying hydrated, and magnesium supplements can help ease mild discomfort.";
      } else if (lower.includes('hydrat') || lower.includes('water')) {
        aiResponseText = "Staying hydrated (around 2,000 ml or 8 glasses daily) helps reduce bloating, water retention, and fatigue during both menstruation and the luteal phase.";
      } else if (lower.includes('cycle day') || lower.includes('mean')) {
        aiResponseText = "Cycle Day 1 is the first day of full period flow. An average cycle spans 28 days, moving through Menstrual, Follicular, Ovulatory, and Luteal phases.";
      } else if (lower.includes('pattern') || lower.includes('logged')) {
        aiResponseText = "Based on your logs: Your cycle length averages 28 days, your sleep quality has been consistent (7h+), and you frequently reach your hydration goals.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          text: aiResponseText
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4 flex flex-col h-[calc(100vh-120px)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>FemCare Wellness Assistant</span>
            <span className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 font-semibold px-2 py-0.5 rounded-full">AI Beta</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            General menstrual & wellness information
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-pink-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? 'You' : '🌸'}
            </div>

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-line shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-pink-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium pl-10">
            <span className="animate-pulse">Assistant is typing... 🌿</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Chips */}
      <div className="shrink-0 space-y-2 pt-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Suggested Questions:
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {AI_SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors"
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-pink-500 shadow-xs"
          />
          <button
            type="submit"
            className="p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl shadow-md transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Mandatory Medical Disclaimer */}
        <div className="text-[10px] text-slate-400 text-center font-medium flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-slate-400" />
          <span>FemCare Assistant provides general information and is not a substitute for professional medical advice.</span>
        </div>
      </div>

    </div>
  );
};
