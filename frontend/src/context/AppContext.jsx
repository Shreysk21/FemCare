import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import {
  getTranslation,
  AVAILABLE_LANGUAGES,
  formatLocalizedDate,
  formatLocalizedNumber,
  registerLanguage
} from '../i18n/translations';
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
  // Authentication State & Session Continuity
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const saved = localStorage.getItem('femcare_auth');
      const token = localStorage.getItem('femcare_token');
      return saved === 'true' && Boolean(token);
    } catch (e) {
      return false;
    }
  });

  // Routing & View State - default to 'auth' (Login page) if unauthenticated, 'home' if logged in
  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem('femcare_auth');
      const token = localStorage.getItem('femcare_token');
      if (saved === 'true' && Boolean(token)) return 'home';
    } catch (e) {}
    return 'auth';
  });
  const [authSubView, setAuthSubView] = useState('login'); 
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [activeTrackTab, setActiveTrackTab] = useState('symptoms');
  const [returnViewAfterAuth, setReturnViewAfterAuth] = useState(null);

  // Live Backend & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // App Data States - Strict User Isolation: clean initial state
  const [user, setUser] = useState({
    id: '',
    name: 'FemCare User',
    email: '',
    avgCycleLength: 28,
    avgPeriodDuration: 5,
    theme: 'light',
    textSize: 'normal',
    privacyMode: 'discreet',
    language: 'en'
  });
  const [cycles, setCycles] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [hydration, setHydration] = useState({
    date: new Date().toISOString().split('T')[0],
    currentMl: 0,
    goalMl: 2000,
    glasses: 0,
    targetGlasses: 8,
    history: []
  });
  const [sleepLogs, setSleepLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [notificationPrefs, setNotificationPrefs] = useState(INITIAL_NOTIFICATION_PREFS);

  // Phase Logs (Persistent per-date menstrual & cycle phase records)
  const [phaseLogs, setPhaseLogs] = useState({});

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
  const [clinicsList, setClinicsList] = useState(INITIAL_HEALTHCARE_CLINICS);
  const [clinicsLoading, setClinicsLoading] = useState(false);
  const [clinicsError, setClinicsError] = useState(null);
  const [clinicsLocationPermission, setClinicsLocationPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'error'
  const [userCoords, setUserCoords] = useState(null);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [clinicRadiusKm, setClinicRadiusKm] = useState(15);
  const [clinicFacilityFilter, setClinicFacilityFilter] = useState('all');
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Wellness Store Cart & Orders State
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(INITIAL_STORE_ORDERS);

  // In-App Notifications State
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Circle Care (Partner Sync & Shared With Me) State
  const [circleInviteModalOpen, setCircleInviteModalOpen] = useState(false);
  const [circleMembers, setCircleMembers] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [sharedWithMeLoading, setSharedWithMeLoading] = useState(false);

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

  // Multilingual State ('en' English, 'hi' Hindi)
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('femcare_language') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('femcare_language', newLang);
      await api.updateProfile({ language: newLang });
    } catch (e) {
      console.warn('[AppContext] Language persistence notice:', e.message);
    }
  };

  const t = useCallback((key, fallback = "") => {
    return getTranslation(language, key, fallback);
  }, [language]);

  // Special Health Conditions State (PCOD/PCOS & Migraine)
  const [trackPcod, setTrackPcod] = useState(false);
  const [trackMigraine, setTrackMigraine] = useState(false);
  const [pcodLogs, setPcodLogs] = useState([]);
  const [migraineLogs, setMigraineLogs] = useState([]);
  const [conditionsSummary, setConditionsSummary] = useState(null);

  // Feedback & Review Submissions State
  const [feedbacks, setFeedbacks] = useState([]);

  // Symptom-Based Predictions State
  const [predictionInsights, setPredictionInsights] = useState(null);

  // Smart Health Alerts State (Evidence-based pattern detection & throttling)
  const [smartAlertData, setSmartAlertData] = useState(null);
  const [activeSmartAlert, setActiveSmartAlert] = useState(null);
  const [dismissedAlertSignatures, setDismissedAlertSignatures] = useState(() => {
    try {
      const saved = localStorage.getItem('femcare_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [urgentAcknowledgedSignatures, setUrgentAcknowledgedSignatures] = useState(() => {
    try {
      const saved = localStorage.getItem('femcare_urgent_acknowledged_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Privacy Shield Toggle (Blur sensitive details)
  const [privacyShield, setPrivacyShield] = useState(false);
  const togglePrivacyShield = () => setPrivacyShield(prev => !prev);

  // Cramp SOS Modal State
  const [crampSosModalOpen, setCrampSosModalOpen] = useState(false);

  // --- INITIAL BACKEND DATA SYNCHRONIZATION ---
  const refreshBackendData = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('femcare_token') : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);

      const [
        profileRes,
        cyclesRes,
        symptomsRes,
        moodsRes,
        hydrationRes,
        sleepRes,
        medsRes,
        activityRes,
        circleRes,
        feedbackRes,
        migraineRes,
        pcodRes,
        conditionsRes,
        predictionsRes,
        smartAlertsRes,
        notificationsRes,
        sharedWithMeRes,
        clinicsRes
      ] = await Promise.allSettled([
        api.getProfile(),
        api.getCycles(),
        api.getSymptoms(),
        api.getMoods(),
        api.getHydration(),
        api.getSleepLogs(),
        api.getMedications(),
        api.getActivityLogs(),
        api.getCircleMembers(),
        api.getMyFeedback(),
        api.getMigraineLogs(),
        api.getPcodLogs(),
        api.getConditionsSummary(),
        api.getPredictionInsights(),
        api.getSmartHealthAlerts(),
        api.getNotifications(),
        api.getSharedWithMe(),
        api.getNearbyClinics({ radiusKm: 15, query: '' })
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setUser(profileRes.value);
        if (profileRes.value.theme) setTheme(profileRes.value.theme);
        if (profileRes.value.textSize) setTextSize(profileRes.value.textSize);
        if (profileRes.value.privacyMode) setPrivacyMode(profileRes.value.privacyMode);
        if (profileRes.value.language) {
          setLanguageState(profileRes.value.language);
          try { localStorage.setItem('femcare_language', profileRes.value.language); } catch (e) {}
        }
        setTrackPcod(Boolean(profileRes.value.trackPcod));
        setTrackMigraine(Boolean(profileRes.value.trackMigraine));
      }
      if (cyclesRes.status === 'fulfilled' && Array.isArray(cyclesRes.value)) {
        setCycles(cyclesRes.value);
        // Build phaseLogs from current user's actual flow logs
        const syncedPhaseLogs = {};
        cyclesRes.value.forEach(cyc => {
          if (cyc.flowLogs && Array.isArray(cyc.flowLogs)) {
            cyc.flowLogs.forEach(fl => {
              syncedPhaseLogs[fl.date] = { phase: 'menstrual', flow: fl.flow };
            });
          }
        });
        setPhaseLogs(syncedPhaseLogs);
      }
      if (symptomsRes.status === 'fulfilled' && Array.isArray(symptomsRes.value)) {
        setSymptomLogs(symptomsRes.value);
      }
      if (moodsRes.status === 'fulfilled' && Array.isArray(moodsRes.value)) {
        setMoodLogs(moodsRes.value);
      }
      if (hydrationRes.status === 'fulfilled' && hydrationRes.value) {
        setHydration(hydrationRes.value);
      }
      if (sleepRes.status === 'fulfilled' && Array.isArray(sleepRes.value)) {
        setSleepLogs(sleepRes.value);
      }
      if (medsRes.status === 'fulfilled' && Array.isArray(medsRes.value)) {
        setMedications(medsRes.value);
      }
      if (activityRes.status === 'fulfilled' && Array.isArray(activityRes.value)) {
        setActivityLogs(activityRes.value);
      }
      if (circleRes.status === 'fulfilled' && Array.isArray(circleRes.value)) {
        setCircleMembers(circleRes.value);
      }
      if (feedbackRes.status === 'fulfilled' && Array.isArray(feedbackRes.value)) {
        setFeedbacks(feedbackRes.value);
      }
      if (migraineRes.status === 'fulfilled' && Array.isArray(migraineRes.value)) {
        setMigraineLogs(migraineRes.value);
      }
      if (pcodRes.status === 'fulfilled' && Array.isArray(pcodRes.value)) {
        setPcodLogs(pcodRes.value);
      }
      if (conditionsRes.status === 'fulfilled' && conditionsRes.value) {
        setConditionsSummary(conditionsRes.value);
      }
      if (predictionsRes.status === 'fulfilled' && predictionsRes.value) {
        setPredictionInsights(predictionsRes.value);
      }
      if (smartAlertsRes.status === 'fulfilled' && smartAlertsRes.value) {
        const alertRes = smartAlertsRes.value;
        setSmartAlertData(alertRes);
        if (alertRes.hasAlert && alertRes.alert) {
          const sig = alertRes.alert.signature;
          let dismissed = [];
          let urgentAcked = [];
          try {
            dismissed = JSON.parse(localStorage.getItem('femcare_dismissed_alerts') || '[]');
            urgentAcked = JSON.parse(localStorage.getItem('femcare_urgent_acknowledged_alerts') || '[]');
          } catch (e) {}

          if (alertRes.alert.level === 'urgent') {
            if (!urgentAcked.includes(sig)) {
              setActiveSmartAlert(alertRes.alert);
            } else {
              setActiveSmartAlert(null);
            }
          } else if (alertRes.alert.level === 'concerning') {
            if (!dismissed.includes(sig)) {
              setActiveSmartAlert(alertRes.alert);
            } else {
              setActiveSmartAlert(null);
            }
          }
        } else {
          setActiveSmartAlert(null);
        }
      }
      if (notificationsRes && notificationsRes.status === 'fulfilled' && Array.isArray(notificationsRes.value)) {
        setInAppNotifications(notificationsRes.value);
      }
      if (sharedWithMeRes && sharedWithMeRes.status === 'fulfilled' && Array.isArray(sharedWithMeRes.value)) {
        setSharedWithMe(sharedWithMeRes.value);
      }
      if (clinicsRes && clinicsRes.status === 'fulfilled' && Array.isArray(clinicsRes.value) && clinicsRes.value.length > 0) {
        setClinicsList(clinicsRes.value);
      }
    } catch (err) {
      console.warn('[AppContext] Backend synchronization notice:', err.message);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshBackendData();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, refreshBackendData]);

  useEffect(() => {
    localStorage.setItem('femcare_circle_care', JSON.stringify(circleMembers));
  }, [circleMembers]);

  // Circle Care Actions with Backend Sync & Email Verification
  const addCircleMember = async (name, role, email, permissions) => {
    try {
      const saved = await api.inviteCircleMember({ name, role, email, permissions });
      if (saved) {
        setCircleMembers(prev => [saved, ...prev.filter(m => m.id !== saved.id)]);
        showToast(`Sharing invitation sent to ${name} (${email})! Status: Pending partner acceptance 💌`);
        return { success: true, member: saved };
      }
    } catch (err) {
      console.warn('[AppContext] Circle invite error:', err.message);
      showToast(err.message || 'Failed to send sharing invitation', null, '⚠️');
      throw err;
    }
  };

  const respondToCircleShare = async (memberId, action) => {
    try {
      const updated = await api.respondToCircleShare(memberId, action);
      if (action === 'accept') {
        showToast('Health data sharing request accepted! 🤝');
      } else {
        showToast('Health data sharing request declined.');
      }
      await fetchSharedWithMe();
      await fetchInAppNotifications();
      return updated;
    } catch (err) {
      console.warn('[AppContext] respondToCircleShare error:', err.message);
      showToast(err.message || 'Error responding to share request', null, '⚠️');
      throw err;
    }
  };

  const revokeCircleShare = async (memberId) => {
    try {
      const updated = await api.revokeCircleShare(memberId);
      setCircleMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'revoked' } : m));
      showToast('Sharing access revoked. Partner can no longer view your health data. 🔒');
      return updated;
    } catch (err) {
      console.warn('[AppContext] revokeCircleShare error:', err.message);
      showToast(err.message || 'Error revoking access', null, '⚠️');
      throw err;
    }
  };

  const fetchSharedWithMe = useCallback(async () => {
    try {
      setSharedWithMeLoading(true);
      const res = await api.getSharedWithMe();
      if (Array.isArray(res)) {
        setSharedWithMe(res);
      }
    } catch (err) {
      console.warn('[AppContext] Failed to fetch shared-with-me:', err.message);
    } finally {
      setSharedWithMeLoading(false);
    }
  }, []);

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

  // In-App Notification Actions
  const fetchInAppNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const res = await api.getNotifications();
      if (Array.isArray(res)) {
        setInAppNotifications(res);
      }
    } catch (err) {
      console.warn('[AppContext] Failed to fetch in-app notifications:', err.message);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markNotificationRead = async (notificationId) => {
    setInAppNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n));
    try {
      await api.markNotificationRead(notificationId);
    } catch (err) {
      console.warn('[AppContext] Failed to mark notification read:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    setInAppNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    try {
      await api.markAllNotificationsRead();
      showToast('All notifications marked as read ✓');
    } catch (err) {
      console.warn('[AppContext] Failed to mark all notifications read:', err.message);
    }
  };

  const deleteNotification = async (notificationId) => {
    setInAppNotifications(prev => prev.filter(n => n.id !== notificationId));
    try {
      await api.deleteNotification(notificationId);
    } catch (err) {
      console.warn('[AppContext] Failed to delete notification:', err.message);
    }
  };

  // Nearby Clinics & Doctors Actions
  const fetchNearbyClinics = useCallback(async ({ lat, lon, query, radius, type } = {}) => {
    try {
      setClinicsLoading(true);
      setClinicsError(null);
      const res = await api.getNearbyClinics({
        latitude: lat !== undefined ? lat : userCoords?.latitude,
        longitude: lon !== undefined ? lon : userCoords?.longitude,
        query: query !== undefined ? query : clinicSearchQuery,
        radiusKm: radius !== undefined ? radius : clinicRadiusKm,
        facilityType: type !== undefined ? type : clinicFacilityFilter
      });
      if (Array.isArray(res) && res.length > 0) {
        setClinicsList(res);
      } else if (Array.isArray(res)) {
        setClinicsList([]);
      }
    } catch (err) {
      console.warn('[AppContext] Fetch clinics notice:', err.message);
      setClinicsError(err.message || 'Unable to retrieve nearby clinics');
    } finally {
      setClinicsLoading(false);
    }
  }, [userCoords, clinicSearchQuery, clinicRadiusKm, clinicFacilityFilter]);

  const requestUserLocation = async () => {
    // 1. Try native Capacitor Geolocation plugin on Android / iOS
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const requested = await Geolocation.requestPermissions();
          if (requested.location !== 'granted') {
            setClinicsLocationPermission('denied');
            showToast('Location permission denied. You can search by city/area manually.', null, '📍');
            return;
          }
        }
        const pos = await Geolocation.getCurrentPosition({ timeout: 10000, enableHighAccuracy: true });
        if (pos?.coords) {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setUserCoords(coords);
          setClinicsLocationPermission('granted');
          showToast('Location approved! Showing verified clinics near you 📍');
          fetchNearbyClinics({ lat: coords.latitude, lon: coords.longitude });
          return;
        }
      }
    } catch (capErr) {
      console.warn('[AppContext] Capacitor Geolocation notice, using web fallback:', capErr.message);
    }

    // 2. Standard Browser Geolocation Fallback
    if (!navigator.geolocation) {
      setClinicsLocationPermission('denied');
      showToast('Geolocation is not supported by your browser. Please enter your city/area manually.', null, '📍');
      return;
    }

    setClinicsLocationPermission('prompt');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setUserCoords(coords);
        setClinicsLocationPermission('granted');
        showToast('Location approved! Showing verified clinics near you 📍');
        fetchNearbyClinics({ lat: coords.latitude, lon: coords.longitude });
      },
      (err) => {
        console.warn('[AppContext] Geolocation denied:', err.message);
        setClinicsLocationPermission('denied');
        showToast('Location permission denied. You can search by city, area, or PIN code manually.', null, '📍');
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
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

  // Local State Reset Action for Clean Account Isolation
  const resetAllLocalState = useCallback(() => {
    setUser({
      id: '',
      name: 'FemCare User',
      email: '',
      avgCycleLength: 28,
      avgPeriodDuration: 5,
      theme: 'light',
      textSize: 'normal',
      privacyMode: 'discreet',
      language: 'en'
    });
    setCycles([]);
    setSymptomLogs([]);
    setMoodLogs([]);
    setHydration({
      date: new Date().toISOString().split('T')[0],
      currentMl: 0,
      goalMl: 2000,
      glasses: 0,
      targetGlasses: 8,
      history: []
    });
    setSleepLogs([]);
    setActivityLogs([]);
    setFoodLogs([]);
    setMedications([]);
    setPcodLogs([]);
    setMigraineLogs([]);
    setFeedbacks([]);
    setPredictionInsights(null);
    setConditionsSummary(null);
    setSmartAlertData(null);
    setActiveSmartAlert(null);
    setPhaseLogs({});
    setCircleMembers([]);
    try {
      localStorage.removeItem('femcare_phase_logs');
    } catch (e) {}
  }, []);

  // User Authentication Lifecycle Actions
  const loginUser = async (credentials, targetView) => {
    let email = 'shreya.patel@example.com';
    let password = 'password123';
    let dest = targetView;

    if (typeof credentials === 'object' && credentials !== null) {
      email = credentials.email || email;
      password = credentials.password || password;
      dest = credentials.targetView || targetView;
    } else if (typeof credentials === 'string') {
      dest = credentials;
    }

    try {
      setIsLoading(true);
      const res = await api.login({ email, password });
      if (res && res.token) {
        localStorage.setItem('femcare_token', res.token);
        localStorage.setItem('femcare_auth', 'true');
        resetAllLocalState();
        setUser(res.user);
        setIsLoggedIn(true);
        showToast(res.message || `Welcome back, ${res.user.name}! 🌸`);
        await refreshBackendData();
        const destination = dest || returnViewAfterAuth || 'home';
        setReturnViewAfterAuth(null);
        setCurrentView(destination);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      showToast(msg, null, '⚠️');
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async ({ name, email, password, targetView }) => {
    try {
      setIsLoading(true);
      const res = await api.signup({ name, email, password });
      if (res && res.token) {
        localStorage.setItem('femcare_token', res.token);
        localStorage.setItem('femcare_auth', 'true');
        resetAllLocalState();
        setUser(res.user);
        setIsLoggedIn(true);
        showToast(res.message || `Welcome to FemCare, ${res.user.name}! 🌸`);
        await refreshBackendData();
        const destination = targetView || returnViewAfterAuth || 'home';
        setReturnViewAfterAuth(null);
        setCurrentView(destination);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Signup failed' };
    } catch (err) {
      const msg = err.message || 'Signup failed';
      showToast(msg, null, '⚠️');
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      localStorage.removeItem('femcare_token');
      localStorage.setItem('femcare_auth', 'false');
      setIsLoggedIn(false);
      resetAllLocalState();
      showToast("Signed out safely", null, "🔒");
      setAuthSubView('login');
      setCurrentView('auth');
    }
  };

  const requireAuth = (callback, returnView) => {
    if (isLoggedIn) {
      if (typeof callback === 'function') callback();
    } else {
      setReturnViewAfterAuth(returnView || currentView);
      setAuthSubView('login');
      setCurrentView('auth');
      showToast("Please sign in to access this feature", null, "🔒");
    }
  };

  // Locale-sensitive formatting utilities
  const formatDate = useCallback((date, options) => {
    return formatLocalizedDate(date, language, options);
  }, [language]);

  const formatNumber = useCallback((num) => {
    return formatLocalizedNumber(num, language);
  }, [language]);

  // --- ACTIONS WITH PERSISTENT BACKEND SYNC ---

  // Period Logging Action with optional Mood & Symptoms
  const addPeriodEntryDetailed = async (startDate, flow = "Medium", optionalMood = null, optionalSymptoms = []) => {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = startDate || today;

    const newFlowLog = { date: targetDate, flow, icon: flow === 'Light' ? '💧' : '🩸' };

    setPhaseLogs(prev => ({
      ...prev,
      [targetDate]: { phase: 'menstrual', flow, mood: optionalMood, symptoms: optionalSymptoms }
    }));

    // Optimistically update cycles (handles 0 cycles cleanly)
    setCycles(prev => {
      const updated = [...prev];
      let currentCycle = updated[0];
      if (!currentCycle) {
        currentCycle = {
          id: `cyc_${Date.now()}`,
          startDate: targetDate,
          endDate: null,
          cycleLength: user.avgCycleLength || 28,
          periodDuration: user.avgPeriodDuration || 5,
          status: 'current',
          flowLogs: [newFlowLog]
        };
        return [currentCycle];
      } else {
        const flowLogs = currentCycle.flowLogs ? [...currentCycle.flowLogs] : [];
        const existingIdx = flowLogs.findIndex(f => f.date === targetDate);
        if (existingIdx >= 0) {
          flowLogs[existingIdx] = newFlowLog;
        } else {
          flowLogs.unshift(newFlowLog);
        }
        updated[0] = { ...currentCycle, flowLogs };
        return updated;
      }
    });

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
        setCycles(prev => {
          const exists = prev.some(c => c.id === savedCycle.id);
          if (exists) {
            return prev.map(c => c.id === savedCycle.id ? savedCycle : c);
          } else {
            return [savedCycle, ...prev.filter(c => !c.id.startsWith('cyc_'))];
          }
        });
      }
      refreshPredictionInsights();
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
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
          flowLogs: (c.flowLogs || []).filter(f => f.date !== dateToDelete)
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
      refreshPredictionInsights();
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
    } catch (err) {
      console.warn('[AppContext] API fallback for delete period entry:', err.message);
    }
  };

  const createCycle = async (cycleData) => {
    try {
      const saved = await api.createCycle(cycleData);
      if (saved) {
        setCycles(prev => [saved, ...prev]);
        showToast("New cycle period recorded 🌸");
        refreshPredictionInsights();
        return saved;
      }
    } catch (err) {
      showToast(err.message || "Failed to create cycle", null, "⚠️");
      throw err;
    }
  };

  const deleteCycle = async (cycleId) => {
    const backup = [...cycles];
    setCycles(prev => prev.filter(c => c.id !== cycleId));
    showToast("Cycle record deleted 🗑️", () => setCycles(backup));

    try {
      await api.deleteCycle(cycleId);
      refreshPredictionInsights();
    } catch (err) {
      console.warn('[AppContext] API fallback for delete cycle:', err.message);
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
      refreshPredictionInsights();
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
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
      refreshPredictionInsights();
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
      refreshPredictionInsights();
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

  // Delete Mood Action
  const deleteMoodLog = async (moodId) => {
    const backup = [...moodLogs];
    setMoodLogs(prev => prev.filter(m => m.id !== moodId));
    showToast(`Mood record removed`, () => setMoodLogs(backup));

    try {
      await api.deleteMood(moodId);
    } catch (err) {
      console.warn('[AppContext] API fallback for delete mood:', err.message);
    }
  };

  // Sleep Actions with API Sync
  const addSleepLog = async (hours, minutes, quality, qualityEmoji) => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `slp_${Date.now()}`;
    const newSleep = {
      id: tempId,
      date: today,
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      quality,
      qualityEmoji: qualityEmoji || '😴'
    };
    setSleepLogs(prev => [newSleep, ...prev]);
    showToast(`Sleep logged: ${hours}h ${minutes}m 😴`);

    try {
      const saved = await api.addSleepLog({
        date: today,
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        quality,
        qualityEmoji: qualityEmoji || '😴',
        notes: ''
      });
      if (saved) {
        setSleepLogs(prev => prev.map(s => s.id === tempId ? saved : s));
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for add sleep:', err.message);
    }
  };

  const deleteSleepLog = async (sleepId) => {
    const backup = [...sleepLogs];
    setSleepLogs(prev => prev.filter(s => s.id !== sleepId));
    showToast(`Sleep log deleted`, () => setSleepLogs(backup));

    try {
      await api.deleteSleepLog(sleepId);
    } catch (err) {
      console.warn('[AppContext] API fallback for delete sleep:', err.message);
    }
  };

  // Medication Actions with API Sync
  const addMedication = async (name, dosage, scheduleTime) => {
    const tempId = `med_${Date.now()}`;
    const newMed = {
      id: tempId,
      name,
      dosage: dosage || "1 tablet",
      scheduleTime: scheduleTime || "08:00 AM",
      reminderEnabled: true
    };
    setMedications(prev => [...prev, newMed]);
    showToast(`Medication added: ${name}`);

    try {
      const saved = await api.addMedication({
        name,
        dosage: dosage || "1 tablet",
        scheduleTime: scheduleTime || "08:00 AM",
        reminderEnabled: true
      });
      if (saved) {
        setMedications(prev => prev.map(m => m.id === tempId ? saved : m));
      }
    } catch (err) {
      console.warn('[AppContext] API fallback for add medication:', err.message);
    }
  };

  const deleteMedication = async (medId) => {
    const backup = [...medications];
    setMedications(prev => prev.filter(m => m.id !== medId));
    showToast(`Medication removed`, () => setMedications(backup));

    try {
      await api.deleteMedication(medId);
    } catch (err) {
      console.warn('[AppContext] API fallback for delete medication:', err.message);
    }
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

  // --- SMART HEALTH ALERTS ACTIONS (Unit 6 Intelligent Assistance) ---

  const evaluateSmartHealthAlerts = useCallback(async () => {
    try {
      const res = await api.getSmartHealthAlerts();
      if (res) {
        setSmartAlertData(res);
        if (res.hasAlert && res.alert) {
          const sig = res.alert.signature;
          let dismissed = [];
          let urgentAcked = [];
          try {
            dismissed = JSON.parse(localStorage.getItem('femcare_dismissed_alerts') || '[]');
            urgentAcked = JSON.parse(localStorage.getItem('femcare_urgent_acknowledged_alerts') || '[]');
          } catch (e) {}

          if (res.alert.level === 'urgent') {
            if (!urgentAcked.includes(sig)) {
              setActiveSmartAlert(res.alert);
            } else {
              setActiveSmartAlert(null);
            }
          } else if (res.alert.level === 'concerning') {
            if (!dismissed.includes(sig)) {
              setActiveSmartAlert(res.alert);
            } else {
              setActiveSmartAlert(null);
            }
          } else {
            setActiveSmartAlert(null);
          }
        } else {
          setActiveSmartAlert(null);
        }
      }
    } catch (err) {
      console.warn('[AppContext] Smart alerts evaluation notice:', err.message);
    }
  }, []);

  const dismissSmartAlert = (signature) => {
    const sig = signature || activeSmartAlert?.signature;
    if (sig) {
      setDismissedAlertSignatures(prev => {
        const next = prev.includes(sig) ? prev : [...prev, sig];
        try { localStorage.setItem('femcare_dismissed_alerts', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }
    setActiveSmartAlert(null);
    showToast(t('smartAlerts.dismissToast', "Alert dismissed. Your health records remain saved and unchanged."));
  };

  const acknowledgeUrgentAlert = (signature) => {
    const sig = signature || activeSmartAlert?.signature;
    if (sig) {
      setUrgentAcknowledgedSignatures(prev => {
        const next = prev.includes(sig) ? prev : [...prev, sig];
        try { localStorage.setItem('femcare_urgent_acknowledged_alerts', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }
    setActiveSmartAlert(null);
    showToast("Urgent guidance acknowledged. Please seek medical evaluation promptly.", null, "🏥");
  };

  const resetSmartAlertThrottles = () => {
    setDismissedAlertSignatures([]);
    setUrgentAcknowledgedSignatures([]);
    try {
      localStorage.removeItem('femcare_dismissed_alerts');
      localStorage.removeItem('femcare_urgent_acknowledged_alerts');
    } catch (e) {}
    evaluateSmartHealthAlerts();
  };

  // --- ENHANCEMENT ACTIONS ---

  const refreshPredictionInsights = async () => {
    try {
      const data = await api.getPredictionInsights();
      if (data) setPredictionInsights(data);
      await evaluateSmartHealthAlerts();
    } catch (err) {
      console.warn('[AppContext] Failed to refresh predictions:', err.message);
    }
  };

  const submitFeedbackAction = async (feedbackData) => {
    try {
      const res = await api.submitFeedback(feedbackData);
      setFeedbacks(prev => [res, ...prev]);
      showToast(t('feedback.successToast', "Thank you! Your feedback has been recorded securely 💌"));
      return res;
    } catch (err) {
      showToast(err.message || "Failed to submit feedback", null, "⚠️");
      throw err;
    }
  };

  const addMigraineAction = async (migraineData) => {
    try {
      const res = await api.addMigraineLog(migraineData);
      setMigraineLogs(prev => [res, ...prev]);
      showToast("Migraine episode logged ⚡");
      refreshPredictionInsights();
      return res;
    } catch (err) {
      showToast(err.message || "Failed to log migraine", null, "⚠️");
      throw err;
    }
  };

  const deleteMigraineAction = async (logId) => {
    setMigraineLogs(prev => prev.filter(m => m.id !== logId));
    showToast("Migraine log removed");
    try {
      await api.deleteMigraineLog(logId);
      refreshPredictionInsights();
    } catch (err) {
      console.warn('[AppContext] Delete migraine fallback:', err.message);
    }
  };

  const updateConditionPreferencesAction = async (prefs) => {
    if (prefs.trackPcod !== undefined) setTrackPcod(prefs.trackPcod);
    if (prefs.trackMigraine !== undefined) setTrackMigraine(prefs.trackMigraine);
    showToast("Special conditions preferences updated 🌸");
    try {
      await api.updateConditionPreferences(prefs);
      const sum = await api.getConditionsSummary();
      if (sum) setConditionsSummary(sum);
    } catch (err) {
      console.warn('[AppContext] Update condition prefs fallback:', err.message);
    }
  };

  // PCOD / PCOS Observational CRUD Actions
  const addPcodLogAction = async (pcodData) => {
    try {
      const res = await api.addPcodLog(pcodData);
      setPcodLogs(prev => [res, ...prev]);
      showToast("PCOD/PCOS observation recorded 🌸");
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
      refreshPredictionInsights();
      return res;
    } catch (err) {
      showToast(err.message || "Failed to record PCOD log", null, "⚠️");
      throw err;
    }
  };

  const updatePcodLogAction = async (logId, pcodData) => {
    try {
      const res = await api.updatePcodLog(logId, pcodData);
      setPcodLogs(prev => prev.map(p => p.id === logId ? res : p));
      showToast("PCOD observation updated 🌸");
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
      refreshPredictionInsights();
      return res;
    } catch (err) {
      showToast(err.message || "Failed to update PCOD log", null, "⚠️");
      throw err;
    }
  };

  const deletePcodLogAction = async (logId) => {
    setPcodLogs(prev => prev.filter(p => p.id !== logId));
    showToast("PCOD observation removed", null, "🗑️");
    try {
      await api.deletePcodLog(logId);
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
      refreshPredictionInsights();
    } catch (err) {
      console.warn('[AppContext] Delete PCOD log fallback:', err.message);
    }
  };

  // Migraine Update Action
  const updateMigraineAction = async (logId, migraineData) => {
    try {
      const res = await api.updateMigraineLog(logId, migraineData);
      setMigraineLogs(prev => prev.map(m => m.id === logId ? res : m));
      showToast("Migraine episode updated ⚡");
      api.getConditionsSummary().then(sum => sum && setConditionsSummary(sum)).catch(() => {});
      refreshPredictionInsights();
      return res;
    } catch (err) {
      showToast(err.message || "Failed to update migraine episode", null, "⚠️");
      throw err;
    }
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

        // Multilingual Support
        language,
        setLanguage,
        t,

        // Special Health Conditions (PCOD/PCOS & Migraine)
        trackPcod,
        setTrackPcod,
        trackMigraine,
        setTrackMigraine,
        pcodLogs,
        migraineLogs,
        conditionsSummary,
        addPcodLog: addPcodLogAction,
        updatePcodLog: updatePcodLogAction,
        deletePcodLog: deletePcodLogAction,
        addMigraineLog: addMigraineAction,
        updateMigraineLog: updateMigraineAction,
        deleteMigraineLog: deleteMigraineAction,
        updateConditionPreferences: updateConditionPreferencesAction,

        // Authentication & Session
        isLoggedIn,
        loginUser,
        signupUser,
        logoutUser,
        requireAuth,
        returnViewAfterAuth,

        // Quick Tracking Navigation
        activeTrackTab,
        setActiveTrackTab,

        // Localized Formatting & Registration
        formatDate,
        formatNumber,
        AVAILABLE_LANGUAGES,
        registerLanguage,

        // Feedback & Reviews
        feedbacks,
        submitFeedback: submitFeedbackAction,

        // Symptom-Based Predictions & Insights
        predictionInsights,
        refreshPredictionInsights,

        // Smart Health Alerts (Evidence-based pattern monitoring)
        smartAlertData,
        activeSmartAlert,
        evaluateSmartHealthAlerts,
        dismissSmartAlert,
        acknowledgeUrgentAlert,
        resetSmartAlertThrottles,

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

        // In-App Notifications
        inAppNotifications,
        notificationsLoading,
        unreadNotificationCount: inAppNotifications.filter(n => n.status === 'unread').length,
        fetchInAppNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,

        // Healthcare & Booking
        clinics,
        clinicsList,
        clinicsLoading,
        clinicsError,
        clinicsLocationPermission,
        userCoords,
        clinicSearchQuery,
        setClinicSearchQuery,
        clinicRadiusKm,
        setClinicRadiusKm,
        clinicFacilityFilter,
        setClinicFacilityFilter,
        fetchNearbyClinics,
        requestUserLocation,
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

        // Circle Care (Partner Sync & Sisterhood)
        circleInviteModalOpen,
        setCircleInviteModalOpen,
        circleMembers,
        sharedWithMe,
        sharedWithMeLoading,
        fetchSharedWithMe,
        addCircleMember,
        respondToCircleShare,
        revokeCircleShare,
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
        createCycle,
        deleteCycle,
        addSymptom,
        updateSymptom,
        deleteSymptom,
        addMoodLog,
        deleteMoodLog,
        addHydrationMl,
        addSleepLog,
        deleteSleepLog,
        addMedication,
        deleteMedication,
        resetAllLocalState
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => useContext(AppContext);
