import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import {
  INITIAL_USER_PROFILE,
  INITIAL_CYCLES,
  INITIAL_SYMPTOM_LOGS,
  INITIAL_MOOD_LOGS,
  INITIAL_HYDRATION_LOG,
  INITIAL_SLEEP_LOGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_FOOD_LOGS,
  INITIAL_MEDICATIONS,
  INITIAL_INSIGHTS,
  INITIAL_NOTIFICATION_PREFS,
  EMPOWERMENT_QUOTES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_HEALTHCARE_CLINICS,
  INITIAL_BOOKINGS,
  WELLNESS_PRODUCTS,
  INITIAL_STORE_ORDERS
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Routing & View State
  const [currentView, setCurrentView] = useState('home'); // home, cycle, track, analytics, community, care, store, ai, notifications, profile
  const [authSubView, setAuthSubView] = useState('login'); 
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Live Backend & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // App Data States
  const [user, setUser] = useState(INITIAL_USER_PROFILE);
  const [cycles, setCycles] = useState(INITIAL_CYCLES);
  const [symptomLogs, setSymptomLogs] = useState(INITIAL_SYMPTOM_LOGS);
  const [moodLogs, setMoodLogs] = useState(INITIAL_MOOD_LOGS);
  const [hydration, setHydration] = useState(INITIAL_HYDRATION_LOG);
  const [sleepLogs, setSleepLogs] = useState(INITIAL_SLEEP_LOGS);
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);
  const [foodLogs, setFoodLogs] = useState(INITIAL_FOOD_LOGS);
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [notificationPrefs, setNotificationPrefs] = useState(INITIAL_NOTIFICATION_PREFS);

  // Phase Logs (Persistent per-date menstrual & cycle phase records)
  const [phaseLogs, setPhaseLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('femcare_phase_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      '2026-09-17': { phase: 'menstrual', flow: 'Heavy' },
      '2026-09-18': { phase: 'menstrual', flow: 'Medium' },
      '2026-09-19': { phase: 'menstrual', flow: 'Medium' },
      '2026-09-20': { phase: 'menstrual', flow: 'Light' },
      '2026-09-21': { phase: 'menstrual', flow: 'Light' },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('femcare_phase_logs', JSON.stringify(phaseLogs));
    } catch (e) {}
  }, [phaseLogs]);

  // Empowerment Quotes State
  const [quoteIndex, setQuoteIndex] = useState(0);
  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % EMPOWERMENT_QUOTES.length);
  };

  // Community Posts State
  const [communityPosts, setCommunityPosts] = useState(INITIAL_COMMUNITY_POSTS);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Healthcare & Bookings State
  const [clinics, setClinics] = useState(INITIAL_HEALTHCARE_CLINICS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Store E-Commerce State
  const [cart, setCart] = useState([]); // [{ product, quantity }]
  const [orders, setOrders] = useState(INITIAL_STORE_ORDERS);

  // Visual Theme & Accessibility
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('femcare_theme') || INITIAL_USER_PROFILE.theme;
    } catch (e) {
      return INITIAL_USER_PROFILE.theme;
    }
  });
  const [textSize, setTextSize] = useState(INITIAL_USER_PROFILE.textSize);
  const [privacyMode, setPrivacyMode] = useState(INITIAL_USER_PROFILE.privacyMode);
  
  // Privacy Shield Toggle (Blur sensitive details)
  const [privacyShield, setPrivacyShield] = useState(false);
  const togglePrivacyShield = () => setPrivacyShield(prev => !prev);

  // Cramp SOS Modal State
  const [crampSosModalOpen, setCrampSosModalOpen] = useState(false);

  // Circle Care (Partner Sync) State
  const [circleInviteModalOpen, setCircleInviteModalOpen] = useState(false);
  const [circleMembers, setCircleMembers] = useState(() => {
    const saved = localStorage.getItem('femcare_circle_care');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "mem_1",
        name: "Alex Johnson",
        role: "Partner",
        email: "alex.j@example.com",
        syncCode: "FEM-8492",
        status: "Connected & Syncing",
        avatar: "💖",
        permissions: {
          phaseAndWindow: true,
          emotionalState: true,
          specificSymptoms: false,
          privateNotes: false
        }
      }
    ];
  });

  // --- INITIAL BACKEND DATA SYNCHRONIZATION ---
  const refreshBackendData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const [profileRes, cyclesRes, symptomsRes, moodsRes, hydrationRes, circleRes] =
        await Promise.allSettled([
          api.getProfile(),
          api.getCycles(),
          api.getSymptoms(),
          api.getMoods(),
          api.getHydration(),
          api.getCircleMembers()
        ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setUser(profileRes.value);
        if (profileRes.value.theme) setTheme(profileRes.value.theme);
        if (profileRes.value.textSize) setTextSize(profileRes.value.textSize);
        if (profileRes.value.privacyMode) setPrivacyMode(profileRes.value.privacyMode);
      }
      if (cyclesRes.status === 'fulfilled' && Array.isArray(cyclesRes.value) && cyclesRes.value.length > 0) {
        setCycles(cyclesRes.value);
      }
      if (symptomsRes.status === 'fulfilled' && Array.isArray(symptomsRes.value) && symptomsRes.value.length > 0) {
        setSymptomLogs(symptomsRes.value);
      }
      if (moodsRes.status === 'fulfilled' && Array.isArray(moodsRes.value) && moodsRes.value.length > 0) {
        setMoodLogs(moodsRes.value);
      }
      if (hydrationRes.status === 'fulfilled' && hydrationRes.value) {
        setHydration(hydrationRes.value);
      }
      if (circleRes.status === 'fulfilled' && Array.isArray(circleRes.value) && circleRes.value.length > 0) {
        setCircleMembers(circleRes.value);
      }
    } catch (err) {
      console.warn('[AppContext] Backend synchronization notice:', err.message);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  useEffect(() => {
    localStorage.setItem('femcare_circle_care', JSON.stringify(circleMembers));
  }, [circleMembers]);

  // Circle Care Actions with Backend Sync
  const addCircleMember = async (name, role, email, permissions) => {
    const randomCode = `FEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempId = `mem_${Date.now()}`;
    const newMember = {
      id: tempId,
      name: name || "Circle Member",
      role: role || "Partner",
      email: email || "partner@example.com",
      syncCode: randomCode,
      status: "Connected & Syncing",
      avatar: role === 'Partner' ? '💖' : role === 'Parent' ? '🏡' : role === 'Friend' ? '🌸' : '🤝',
      permissions: permissions || {
        phaseAndWindow: true,
        emotionalState: true,
        specificSymptoms: false,
        privateNotes: false
      }
    };
    setCircleMembers(prev => [...prev, newMember]);
    showToast(`Circle Care invite sent to ${name} (${role})! Sync Code: ${randomCode} 💌`);

    try {
      const saved = await api.inviteCircleMember({ name, role, email, permissions });
      if (saved) {
        setCircleMembers(prev => prev.map(m => m.id === tempId ? saved : m));
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for circle invite:', err.message);
    }
  };

  const updateMemberPermissions = async (memberId, updatedPermissions) => {
    setCircleMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: updatedPermissions } : m));
    showToast(`Updated sharing permissions for member`);

    try {
      await api.updateMemberPermissions(memberId, updatedPermissions);
    } catch (err) {
      console.warn('[AppContext] API fallback for member permissions:', err.message);
    }
  };

  const deleteCircleMember = async (memberId) => {
    setCircleMembers(prev => prev.filter(m => m.id !== memberId));
    showToast(`Removed member from Circle Care`);

    try {
      await api.deleteCircleMember(memberId);
    } catch (err) {
      console.warn('[AppContext] API fallback for delete circle member:', err.message);
    }
  };

  const sendPartnerCareGesture = (gestureText, fromName = "Alex (Partner)") => {
    showToast(`Received Care Gesture: "${gestureText}" from ${fromName}! 💖`, null, "🎁");
  };

  // HCI Benchmark & Telemetry State
  const [hciBenchmarkMode, setHciBenchmarkMode] = useState(true);
  const [symptomLoggingVariant, setSymptomLoggingVariant] = useState('variantB'); // 'variantA' (flat 24) or 'variantB' (hick-hyman chunked)
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  
  const [telemetryStats, setTelemetryStats] = useState(() => {
    const saved = localStorage.getItem('femcare_hci_telemetry');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      variantA: { sessions: 4, avgCompletionMs: 14500, avgTTFIMs: 2400, totalErrors: 5 },
      variantB: { sessions: 7, avgCompletionMs: 6200, avgTTFIMs: 850, totalErrors: 1 },
      currentSession: {
        startTime: Date.now(),
        firstInteractionTime: null,
        errors: 0,
        completed: false,
        completionTimeMs: 0
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('femcare_hci_telemetry', JSON.stringify(telemetryStats));
  }, [telemetryStats]);

  const recordFirstInteraction = () => {
    setTelemetryStats(prev => {
      if (prev.currentSession.firstInteractionTime) return prev;
      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          firstInteractionTime: Date.now()
        }
      };
    });
  };

  const recordMisclick = () => {
    setTelemetryStats(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        errors: prev.currentSession.errors + 1
      }
    }));
  };

  const recordTaskCompletion = (variant = symptomLoggingVariant) => {
    const now = Date.now();
    setTelemetryStats(prev => {
      const startTime = prev.currentSession.startTime || now - 5000;
      const totalTime = Math.max(now - startTime, 1200);
      const ttfi = prev.currentSession.firstInteractionTime ? (prev.currentSession.firstInteractionTime - startTime) : 1100;
      const errors = prev.currentSession.errors;

      const variantKey = variant === 'variantA' ? 'variantA' : 'variantB';
      const curVariantData = prev[variantKey];
      const newSessions = curVariantData.sessions + 1;
      const newAvgTime = Math.round((curVariantData.avgCompletionMs * curVariantData.sessions + totalTime) / newSessions);
      const newAvgTTFI = Math.round((curVariantData.avgTTFIMs * curVariantData.sessions + ttfi) / newSessions);
      const newErrors = curVariantData.totalErrors + errors;

      return {
        ...prev,
        [variantKey]: {
          sessions: newSessions,
          avgCompletionMs: newAvgTime,
          avgTTFIMs: newAvgTTFI,
          totalErrors: newErrors
        },
        currentSession: {
          startTime: Date.now(),
          firstInteractionTime: null,
          errors: 0,
          completed: true,
          completionTimeMs: totalTime
        }
      };
    });
  };

  const resetCurrentTelemetrySession = () => {
    setTelemetryStats(prev => ({
      ...prev,
      currentSession: {
        startTime: Date.now(),
        firstInteractionTime: null,
        errors: 0,
        completed: false,
        completionTimeMs: 0
      }
    }));
  };

  // Phase-Adaptive Home Screen State ('menstrual' or 'follicular')
  const [homePhaseMode, setHomePhaseMode] = useState('menstrual');

  // Radial Pie Menu State
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);

  // FSM Dialog State Machine (Unit 6 Formal Dialog Modeling)
  const [fsmState, setFsmState] = useState('IDLE'); // IDLE, PROMPT_SYMPTOM, SELECT_SEVERITY, NOTE_INPUT_OPTIONAL, SAVING, SYNC_CONFIRMED, ERROR_FALLBACK
  const [fsmPayload, setFsmPayload] = useState({});
  const [fsmHistory, setFsmHistory] = useState([
    { from: '-', to: 'IDLE', event: 'INIT', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [fsmInspectorOpen, setFsmInspectorOpen] = useState(false);
  const [fsmLoggingModalOpen, setFsmLoggingModalOpen] = useState(false);

  const transitionFSM = (nextState, eventName, payloadUpdate = {}) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setFsmState(prevState => {
      setFsmHistory(prevH => [
        ...prevH,
        { from: prevState, to: nextState, event: eventName, timestamp: timeStr }
      ]);
      return nextState;
    });
    setFsmPayload(prev => ({ ...prev, ...payloadUpdate }));
  };

  // Toast Reversibility System
  const [toast, setToast] = useState(null);

  // Theme Sync effect - attaches [data-theme] to <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Set standard data-theme attribute
    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);

    try {
      localStorage.setItem('femcare_theme', theme);
    } catch (e) {}

    // Clean legacy classes
    body.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-lavender',
      'theme-sage',
      'theme-forest',
      'theme-ocean',
      'theme-sunset',
      'dark'
    );
    root.classList.remove('dark');

    body.classList.add(`theme-${theme}`);
    if (theme === 'dark') {
      body.classList.add('dark');
      root.classList.add('dark');
    }
  }, [theme]);

  // Toast Helper
  const showToast = (message, undoAction = null, icon = '✓') => {
    setToast({ message, undoAction, icon });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleUndo = () => {
    if (toast && toast.undoAction) {
      toast.undoAction();
      setToast({ message: "Action reversed successfully ↩️", undoAction: null, icon: "↺" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // --- ACTIONS WITH PERSISTENT BACKEND SYNC ---

  // Period Logging Action with optional Mood & Symptoms
  const addPeriodEntryDetailed = async (startDate, flow = "Medium", optionalMood = null, optionalSymptoms = []) => {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = startDate || today;

    const updatedCycles = [...cycles];
    const currentCycle = updatedCycles[0];

    const newFlowLog = { date: targetDate, flow, icon: flow === 'Light' ? '💧' : '🩸' };

    const existingIndex = currentCycle.flowLogs.findIndex(f => f.date === targetDate);
    if (existingIndex >= 0) {
      currentCycle.flowLogs[existingIndex] = newFlowLog;
    } else {
      currentCycle.flowLogs.unshift(newFlowLog);
    }

    setCycles(updatedCycles);
    setPhaseLogs(prev => ({
      ...prev,
      [targetDate]: { phase: 'menstrual', flow, mood: optionalMood, symptoms: optionalSymptoms }
    }));

    // Optional Mood
    if (optionalMood) {
      addMoodLog(optionalMood, "Recorded during period log");
    }

    // Optional Symptoms
    if (optionalSymptoms && optionalSymptoms.length > 0) {
      optionalSymptoms.forEach(sym => {
        addSymptom(sym.name, sym.category || "Pain & Discomfort", "Moderate", "Recorded during period log");
      });
    }

    showToast(`Period logged for ${targetDate} (${flow} flow) 🌸`);

    try {
      const savedCycle = await api.logCycleFlow({
        startDate: targetDate,
        flow,
        optionalMood,
        optionalSymptoms
      });
      if (savedCycle) {
        setCycles(prev => prev.map(c => c.id === savedCycle.id ? savedCycle : c));
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for period logging:', err.message);
    }
  };

  const deletePeriodEntry = async (cycleId, dateToDelete) => {
    const backup = JSON.parse(JSON.stringify(cycles));
    setCycles(prev => prev.map(c => {
      if (c.id === cycleId) {
        return {
          ...c,
          flowLogs: c.flowLogs.filter(f => f.date !== dateToDelete)
        };
      }
      return c;
    }));
    setPhaseLogs(prev => {
      const next = { ...prev };
      delete next[dateToDelete];
      return next;
    });
    showToast(`Period entry removed`, () => setCycles(backup), "🗑️");

    try {
      await api.deleteCycleFlow(cycleId, dateToDelete);
    } catch (err) {
      console.warn('[AppContext] API fallback for delete period entry:', err.message);
    }
  };

  // Menstrual Phase Logging Action (Date-specific phase selection)
  const logPhaseForDate = async (dateStr, { phase, flow = "Medium", mood = null, symptoms = [], notes = "", isPeriodStart = false }) => {
    setPhaseLogs(prev => ({
      ...prev,
      [dateStr]: { phase, flow, mood, symptoms, notes, isPeriodStart }
    }));

    if (phase === 'menstrual') {
      await addPeriodEntryDetailed(dateStr, flow, mood, symptoms);
    } else {
      // If date was previously tracked in cycles flowLogs, remove flow log so period counts stay aligned
      const currentCycle = cycles[0];
      if (currentCycle && currentCycle.flowLogs?.some(f => f.date === dateStr)) {
        setCycles(prev => prev.map(c => ({
          ...c,
          flowLogs: c.flowLogs.filter(f => f.date !== dateStr)
        })));
      }
      const phaseNames = {
        follicular: 'Follicular Phase 🌱',
        ovulation: 'Ovulation Window ✨',
        luteal: 'Luteal Phase 🌙'
      };
      showToast(`Logged ${phaseNames[phase] || 'Phase'} for ${dateStr} 🌸`);
    }

    if (notes) {
      addSymptom("Cycle Notes", "General", "Mild", notes);
    }
  };

  const deletePhaseForDate = async (dateStr) => {
    const backupPhase = { ...phaseLogs };
    setPhaseLogs(prev => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });

    const currentCycle = cycles[0];
    if (currentCycle && currentCycle.flowLogs?.some(f => f.date === dateStr)) {
      await deletePeriodEntry(currentCycle.id, dateStr);
    }
    showToast(`Phase record removed for ${dateStr}`, () => setPhaseLogs(backupPhase), "🗑️");
  };

  // Symptom Logging
  const addSymptom = async (symptomName, category, severity = "Moderate", notes = "") => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `sym_${Date.now()}`;
    const newLog = {
      id: tempId,
      date: today,
      symptomId: symptomName.toLowerCase().replace(/\s+/g, '_'),
      symptomName,
      category: category || "General",
      severity,
      timeLogged: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes
    };
    setSymptomLogs(prev => [newLog, ...prev]);
    showToast(`Logged symptom: ${symptomName} (${severity})`);

    try {
      const saved = await api.addSymptom({ symptomName, category, severity, notes });
      if (saved) {
        setSymptomLogs(prev => prev.map(s => s.id === tempId ? saved : s));
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for add symptom:', err.message);
    }
  };

  const updateSymptom = async (symptomId, updatedSeverity, updatedNotes) => {
    const backup = [...symptomLogs];
    setSymptomLogs(prev => prev.map(s => s.id === symptomId ? { ...s, severity: updatedSeverity, notes: updatedNotes } : s));
    showToast(`Symptom log updated`, () => setSymptomLogs(backup));

    try {
      await api.updateSymptom(symptomId, { severity: updatedSeverity, notes: updatedNotes });
    } catch (err) {
      console.warn('[AppContext] API fallback for update symptom:', err.message);
    }
  };

  const deleteSymptom = async (symptomId) => {
    const backup = [...symptomLogs];
    setSymptomLogs(prev => prev.filter(s => s.id !== symptomId));
    showToast(`Symptom log deleted`, () => setSymptomLogs(backup));

    try {
      await api.deleteSymptom(symptomId);
    } catch (err) {
      console.warn('[AppContext] API fallback for delete symptom:', err.message);
    }
  };

  // Mood Logging
  const addMoodLog = async (moodObj, note = "") => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `m_${Date.now()}`;
    const newMood = {
      id: tempId,
      date: today,
      moodId: moodObj.id,
      label: moodObj.label,
      emoji: moodObj.emoji,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note
    };
    setMoodLogs(prev => [newMood, ...prev]);
    showToast(`Mood recorded: ${moodObj.emoji} ${moodObj.label}`);

    try {
      const saved = await api.addMood(moodObj, note);
      if (saved) {
        setMoodLogs(prev => prev.map(m => m.id === tempId ? saved : m));
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for add mood:', err.message);
    }
  };

  // Hydration Action
  const addHydrationMl = async (mlAmount) => {
    setHydration(prev => {
      const newMl = prev.currentMl + mlAmount;
      const newGlasses = Math.min(Math.round(newMl / 250), 12);
      return {
        ...prev,
        currentMl: newMl,
        glasses: newGlasses,
        history: [
          ...prev.history,
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amountMl: mlAmount }
        ]
      };
    });
    showToast(`Added ${mlAmount} ml water 💧`);

    try {
      const updated = await api.addHydration(mlAmount);
      if (updated) {
        setHydration(updated);
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for add hydration:', err.message);
    }
  };

  // User Profile Action
  const updateUserProfile = async (newProfileData) => {
    setUser(prev => ({ ...prev, ...newProfileData }));
    showToast(`Profile updated successfully 🌸`);

    try {
      const updated = await api.updateProfile(newProfileData);
      if (updated) {
        setUser(updated);
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for update profile:', err.message);
    }
  };

  // Sleep Action
  const addSleepLog = (hours, minutes, quality, qualityEmoji) => {
    const today = new Date().toISOString().split('T')[0];
    const newSleep = {
      id: `slp_${Date.now()}`,
      date: today,
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      quality,
      qualityEmoji
    };
    setSleepLogs(prev => [newSleep, ...prev]);
    showToast(`Sleep logged: ${hours}h ${minutes}m 😴`);
  };

  // Medication Actions
  const addMedication = (name, dosage, scheduleTime) => {
    const newMed = {
      id: `med_${Date.now()}`,
      name,
      dosage,
      scheduleTime,
      reminderEnabled: true
    };
    setMedications(prev => [...prev, newMed]);
    showToast(`Medication added: ${name}`);
  };

  const deleteMedication = (medId) => {
    const backup = [...medications];
    setMedications(prev => prev.filter(m => m.id !== medId));
    showToast(`Medication removed`, () => setMedications(backup));
  };

  // Community Forum Actions
  const addCommunityPost = (title, category, body) => {
    const newPost = {
      id: `post_${Date.now()}`,
      author: "Anonymous Sister",
      avatar: "🌸",
      category,
      timeAgo: "Just now",
      title,
      body,
      likes: 0,
      liked: false,
      replies: []
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    showToast(`Anonymous post shared with community 💬`);
  };

  const toggleLikePost = (postId) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
    }));
  };

  const addReplyToPost = (postId, replyText) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [
            ...p.replies,
            { id: `r_${Date.now()}`, author: "Anonymous Sister", timeAgo: "Just now", text: replyText }
          ]
        };
      }
      return p;
    }));
    showToast(`Reply added anonymously 💬`);
  };

  const reportPost = (postId) => {
    showToast(`Post reported to moderators for review 🛡️`);
  };

  const blockUser = (authorName) => {
    setBlockedUsers(prev => [...prev, authorName]);
    setCommunityPosts(prev => prev.filter(p => p.author !== authorName));
    showToast(`Blocked user content successfully`);
  };

  // Healthcare Consultation Booking Action
  const addBooking = (clinicName, doctorName, type, date, time, notes = "") => {
    const newBooking = {
      id: `bk_${Date.now()}`,
      clinicName,
      doctorName,
      type,
      date,
      time,
      status: "Confirmed",
      notes
    };
    setBookings(prev => [newBooking, ...prev]);
    showToast(`Consultation booked: ${date} at ${time} 🏥`);
  };

  // Wellness Store Cart & Order Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name.substring(0, 22)}... to cart 🛍️`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const checkoutOrder = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const newOrder = {
      id: `ord_${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      total: Number((subtotal + 4.99).toFixed(2)),
      status: "Confirmed & Packing",
      items: cart.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price }))
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    showToast(`Order placed successfully! Order #${newOrder.id} 🎉`);
  };

  return (
    <AppContext.Provider
      value={{
        // View routing
        currentView,
        setCurrentView,
        authSubView,
        setAuthSubView,
        onboardingStep,
        setOnboardingStep,

        // Live Backend & Loading States
        isLoading,
        apiError,
        refreshBackendData,
        updateUserProfile,

        // Data
        user,
        setUser,
        cycles,
        symptomLogs,
        moodLogs,
        hydration,
        sleepLogs,
        activityLogs,
        foodLogs,
        medications,
        insights,
        notificationPrefs,

        // Empowerment Quotes
        currentQuote: EMPOWERMENT_QUOTES[quoteIndex],
        nextQuote,

        // Community Forum
        communityPosts,
        addCommunityPost,
        toggleLikePost,
        addReplyToPost,
        reportPost,
        blockUser,

        // Healthcare & Booking
        clinics,
        bookings,
        addBooking,

        // Store & Orders
        products: WELLNESS_PRODUCTS,
        cart,
        orders,
        addToCart,
        removeFromCart,
        updateCartQty,
        checkoutOrder,

        // Themes & Accessibility
        theme,
        setTheme,
        textSize,
        setTextSize,
        privacyMode,
        setPrivacyMode,
        privacyShield,
        setPrivacyShield,
        togglePrivacyShield,
        crampSosModalOpen,
        setCrampSosModalOpen,

        // Circle Care (Partner Sync)
        circleInviteModalOpen,
        setCircleInviteModalOpen,
        circleMembers,
        addCircleMember,
        updateMemberPermissions,
        deleteCircleMember,
        sendPartnerCareGesture,

        // HCI Benchmark & Telemetry
        hciBenchmarkMode,
        setHciBenchmarkMode,
        symptomLoggingVariant,
        setSymptomLoggingVariant,
        telemetryModalOpen,
        setTelemetryModalOpen,
        telemetryStats,
        recordFirstInteraction,
        recordMisclick,
        recordTaskCompletion,
        resetCurrentTelemetrySession,

        // Home Phase Mode
        homePhaseMode,
        setHomePhaseMode,

        // Radial Menu
        radialMenuOpen,
        setRadialMenuOpen,

        // FSM Inspector & State Machine
        fsmState,
        fsmPayload,
        fsmHistory,
        fsmInspectorOpen,
        setFsmInspectorOpen,
        fsmLoggingModalOpen,
        setFsmLoggingModalOpen,
        transitionFSM,

        // Toast
        toast,
        showToast,
        handleUndo,

        // CRUD Actions
        phaseLogs,
        logPhaseForDate,
        deletePhaseForDate,
        addPeriodEntryDetailed,
        deletePeriodEntry,
        addSymptom,
        updateSymptom,
        deleteSymptom,
        addMoodLog,
        addHydrationMl,
        addSleepLog,
        addMedication,
        deleteMedication
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
