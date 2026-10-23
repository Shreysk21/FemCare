import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AI_SUGGESTED_QUESTIONS } from '../data/mockData';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Square,
  AlertCircle
} from 'lucide-react';

export const AiAssistantView = () => {
  const { user, language, t } = useApp();

  const getInitialGreeting = () => {
    const firstName = user.name ? user.name.split(' ')[0] : 'there';
    const greetings = {
      hi: `नमस्ते ${firstName}! 🌸 मैं आपकी फेमकेयर वेलनेस सहायक हूँ। मैं माहवारी चक्र, लक्षण, नींद, जल सेवन और वेलनेस पैटर्न संबंधी प्रश्नों में आपकी सहायता कर सकती हूँ।\n\nआज मैं आपकी कैसे मदद कर सकती हूँ?`,
      mr: `नमस्कार ${firstName}! 🌸 मी तुमची फेमकेअर वेलनेस सहाय्यक आहे. मी मासिक पाळी, लक्षणे, झोप, पाणी आणि वेलनेस पॅटर्न संदर्भात मदत करू शकते.\n\nआज मी तुम्हाला कशी मदत करू?`,
      bn: `নমস্কার ${firstName}! 🌸 আমি আপনার ফেমকেয়ার সুস্থতা সহকারী। আমি মাসিক চক্র, উপসর্গ, ঘুম এবং সুস্থতা বিষয়ক প্রশ্নের উত্তর দিতে পারি।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?`,
      es: `¡Hola ${firstName}! 🌸 Soy tu asistente de bienestar FemCare. Puedo ayudarte con preguntas sobre tu ciclo, síntomas, sueño, hidratación y bienestar.\n\n¿Cómo puedo apoyarte hoy?`,
      it: `Ciao ${firstName}! 🌸 Sono la tua assistente per il benessere FemCare. Posso aiutarti a rispondere a domande su ciclo, sintomi, sonno e idratazione.\n\nCome posso aiutarti oggi?`,
      tr: `Merhaba ${firstName}! 🌸 Ben FemCare Sağlık Asistanınızım. Döngü takibi, semptomlar, uyku ve sağlık alışkanlıkları konularında yardımcı olabilirim.\n\nBugün size nasıl yardımcı olabilirim?`,
      en: `Hi ${firstName}! 🌸 I am your FemCare Wellness Assistant. I can help answer general questions about cycle tracking, symptoms, sleep, hydration, and wellness patterns.\n\nHow can I support you today?`
    };
    return greetings[language] || greetings.en;
  };

  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      sender: 'ai',
      text: getInitialGreeting()
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [voiceInputError, setVoiceInputError] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [autoVoiceOutput, setAutoVoiceOutput] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Input (Speech-to-Text) Toggle
  const toggleListening = () => {
    setVoiceInputError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceInputError(t('ai.speechUnsupported', 'Voice recognition is not supported in this browser. Please type your message.'));
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      const langSpeechMap = {
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        es: 'es-ES',
        it: 'it-IT',
        tr: 'tr-TR',
        en: 'en-US'
      };
      recognition.lang = langSpeechMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceInputError('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputQuery(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceInputError('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceInputError('No speech detected. Please speak clearly into your microphone.');
        } else {
          setVoiceInputError(`Voice error: ${event.error}. Please try again or type.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceInputError(err.message || 'Could not start voice recognition.');
    }
  };

  // Voice Output (Text-to-Speech)
  const speakText = (text, msgId) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMsgId(msgId);

    const cleanText = text.replace(/[🌸🌿✨🩸🆘•\n]/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Multi-language selection for voice synthesis
    const langSpeechMap = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      es: 'es-ES',
      it: 'it-IT',
      tr: 'tr-TR',
      en: 'en-US'
    };
    utterance.lang = langSpeechMap[language] || 'en-US';

    // Try finding an appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetPrefix = (langSpeechMap[language] || 'en').split('-')[0].toLowerCase();
      const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAllSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  const handleSendMessage = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    // Stop listening if mic was active
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setVoiceInputError('');
    setIsTyping(true);

    // Simulate AI thinking and typing response with non-diagnostic guidance
    setTimeout(() => {
      let aiResponseText = language === 'hi'
        ? "फेमकेयर सहायक सामान्य वेलनेस मार्गदर्शन प्रदान करता है। निरंतर असुविधा होने पर चिकित्सक से परामर्श लें।"
        : "FemCare Assistant provides general wellness guidelines. For persistent discomfort, consult a physician.";

      const lower = textToSend.toLowerCase();

      if (lower.includes('cramps') || lower.includes('pain') || lower.includes('दर्द') || lower.includes('क्रैम्प')) {
        aiResponseText = language === 'hi'
          ? "मासिक धर्म के दौरान पेट दर्द मुख्य रूप से प्रोस्टाग्लैंडिंस के कारण गर्भाशय संकुचन से होता है। हल्का सेक (हीट पैड), 4-7-8 शांत श्वास अभ्यास, पर्याप्त जल सेवन और हल्का व्यायाम राहत पहुँचाते हैं।"
          : "Abdominal cramps during your cycle are primarily caused by prostaglandins triggering uterine contractions. Gentle heat pads, light stretching, staying hydrated, and magnesium supplements can help ease mild discomfort.";
      } else if (lower.includes('hydrat') || lower.includes('water') || lower.includes('पानी') || lower.includes('जल')) {
        aiResponseText = language === 'hi'
          ? "पर्याप्त जल सेवन (लगभग 2,000 मिली या 8 गिलास प्रतिदिन) माहवारी और ल्यूटियल चरण के दौरान सूजन, जल प्रतिधारण और थकान को कम करने में मदद करता है।"
          : "Staying hydrated (around 2,000 ml or 8 glasses daily) helps reduce bloating, water retention, and fatigue during both menstruation and the luteal phase.";
      } else if (lower.includes('pcod') || lower.includes('pcos') || lower.includes('पीसीओडी')) {
        aiResponseText = language === 'hi'
          ? "पीसीओडी/पीसीओएस एक सामान्य हार्मोनल स्थिति है। संतुलित आहार, नियमित शारीरिक गतिविधि, तनाव प्रबंधन और चक्र अनियमितता की निरंतर ट्रैकिंग सहायक होती है। औपचारिक निदान हेतु स्त्री रोग विशेषज्ञ से मिलें।"
          : "PCOD/PCOS involves hormonal imbalances that can cause cycle irregularity, skin changes, and fatigue. Tracking cycles, maintaining balanced nutrition, and consulting a gynecologist for personalized clinical guidance is recommended.";
      } else if (lower.includes('migraine') || lower.includes('headache') || lower.includes('सिरदर्द') || lower.includes('माइग्रेन')) {
        aiResponseText = language === 'hi'
          ? "माहवारी से जुड़े सिरदर्द या माइग्रेन अक्सर एस्ट्रोजेन के स्तर में बदलाव, खराब नींद या तनाव से ट्रिगर होते हैं। शांत व अंधेरे कमरे में आराम, जल सेवन और ट्रिगर्स को ट्रैक करना उपयोगी रहता है।"
          : "Menstrual-related migraines are frequently triggered by rapid estrogen shifts prior to flow, stress, or poor sleep. Resting in a quiet dark room, staying hydrated, and recording personal triggers helps identify lifestyle patterns.";
      } else if (lower.includes('cycle day') || lower.includes('mean') || lower.includes('चक्र')) {
        aiResponseText = language === 'hi'
          ? "चक्र का पहला दिन (दिन 1) माहवारी शुरू होने का दिन होता है। औसत चक्र 28 दिनों का होता है, जो मासिक धर्म, फॉलिक्युलर, ओव्यूलेशन और ल्यूटियल चरणों से गुजरता है।"
          : "Cycle Day 1 is the first day of full period flow. An average cycle spans 28 days, moving through Menstrual, Follicular, Ovulatory, and Luteal phases.";
      } else if (lower.includes('pattern') || lower.includes('logged') || lower.includes('लॉग')) {
        aiResponseText = language === 'hi'
          ? "आपके लॉग के आधार पर: आपका औसत चक्र 28 दिनों का है, नींद गुणवत्ता 7+ घंटे नियमित रही है, और आप अपने जल सेवन लक्ष्य तक पहुँच रही हैं।"
          : "Based on your logs: Your cycle length averages 28 days, your sleep quality has been consistent (7h+), and you frequently reach your hydration goals.";
      }

      const newAiMsgId = `msg_${Date.now() + 1}`;
      setMessages(prev => [
        ...prev,
        {
          id: newAiMsgId,
          sender: 'ai',
          text: aiResponseText
        }
      ]);
      setIsTyping(false);

      // Auto-read voice output if enabled
      if (autoVoiceOutput) {
        speakText(aiResponseText, newAiMsgId);
      }
    }, 750);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4 flex flex-col h-[calc(100vh-120px)]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t('ai.title', 'FemCare Wellness Assistant')}</span>
              <span className="text-[10px] bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Mic className="w-3 h-3" />
                <span>{t('ai.betaBadge', 'Voice Enabled')}</span>
              </span>
            </h2>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              {t('ai.subtitle', 'Menstrual & general wellness information with speech interaction')}
            </p>
          </div>
        </div>

        {/* Global Voice Controls */}
        <div className="flex items-center gap-1.5">
          {speakingMsgId && (
            <button
              onClick={stopAllSpeech}
              className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200 text-xs font-bold flex items-center gap-1"
              title={t('ai.voiceOutputStop', 'Stop Audio')}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline text-[10px]">{t('ai.voiceOutputStop', 'Stop')}</span>
            </button>
          )}

          <button
            onClick={() => setAutoVoiceOutput(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
              autoVoiceOutput
                ? 'bg-purple-100 dark:bg-purple-950 border-purple-400 text-purple-700 dark:text-purple-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={autoVoiceOutput ? "Voice readout active" : "Enable voice readout"}
          >
            {autoVoiceOutput ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[10px] hidden sm:inline">{t('ai.autoVoiceToggle', 'Auto-Read')}</span>
          </button>
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
                  : 'bg-pink-600 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? 'You' : '🌸'}
            </div>

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-line shadow-xs relative group ${
                msg.sender === 'user'
                  ? 'bg-pink-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              <div>{msg.text}</div>

              {/* Text-to-Speech Controls on AI Message Bubbles (Requirement 4) */}
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => speakText(msg.text, msg.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    title={speakingMsgId === msg.id ? t('ai.voiceOutputStop', 'Stop Audio') : t('ai.voiceOutputRead', 'Read Response Aloud')}
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <Square className="w-3 h-3 fill-current text-rose-500 animate-pulse" />
                        <span className="text-[10px] text-rose-500">{t('ai.voiceOutputStop', 'Stop')}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{t('ai.voiceOutputRead', 'Listen')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => speakText(msg.text, `replay_${msg.id}_${Date.now()}`)}
                    className="p-1 rounded-lg text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                    title={t('ai.voiceReplay', 'Replay Voice')}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[10px]">{t('ai.voiceReplay', 'Replay')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold pl-10">
            <span className="animate-pulse">Assistant is typing... 🌿</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="shrink-0 space-y-2 pt-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {t('ai.suggestedQuestions', 'Suggested Questions:')}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {AI_SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box with Voice Interaction */}
      <div className="shrink-0 space-y-2">
        {/* Voice Error Notice */}
        {voiceInputError && (
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{voiceInputError}</span>
            </div>
            <button
              onClick={() => setVoiceInputError('')}
              className="text-[10px] font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Listening Active Visual Indicator */}
        {isListening && (
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 flex items-center justify-between text-xs text-purple-800 dark:text-purple-200">
            <div className="flex items-center gap-2 font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>{t('ai.voiceInputListening', 'Listening... Speak clearly now')}</span>
            </div>
            <button
              onClick={toggleListening}
              className="px-2 py-0.5 rounded-md bg-purple-200 dark:bg-purple-800 text-[10px] font-bold"
            >
              Stop
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Speech-to-Text Button (Requirement 4) */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg ring-4 ring-rose-400/30 animate-pulse'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 hover:text-pink-600'
            }`}
            title={isListening ? "Stop listening" : t('ai.voiceInputStart', 'Start Voice Input (Speech-to-Text)')}
            aria-label="Toggle Microphone Input"
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            )}
          </button>

          {/* Editable Text Input so User Can Review Voice Output Before Sending */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? "Listening... Speak now"
                : t('ai.inputPlaceholder', 'Type or use voice to ask a wellness question...')
            }
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-pink-500 shadow-xs"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className={`p-3 bg-pink-600 text-white rounded-2xl shadow-md transition-all shrink-0 ${
              !inputQuery.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700 hover:scale-105 active:scale-95'
            }`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Mandatory Medical Disclaimer */}
        <div className="text-[11px] text-slate-600 dark:text-slate-400 text-center font-medium flex items-center justify-center gap-1.5 pt-1">
          <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span>{t('ai.disclaimer', 'FemCare Assistant provides general information and is not a substitute for professional medical advice.')}</span>
        </div>
      </div>

    </div>
  );
};
