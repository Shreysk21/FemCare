// Centralized API Client Service for FemCare
// Integrates React frontend with FastAPI backend & Supabase/PostgreSQL database

const BASE_URL = '/api';

/**
 * Generic request helper with automatic JSON parsing and robust error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('femcare_token') : null;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[FemCare API] Failed request to ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // --- AUTHENTICATION ---
  async login({ email, password }) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup({ name, email, password }) {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  async logout() {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  // --- USER PROFILE ---
  async getProfile() {
    return request('/profile');
  },

  async updateProfile(profileData) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // --- CYCLES & FLOW LOGS ---
  async getCycles() {
    return request('/cycles');
  },

  async createCycle(cycleData) {
    return request('/cycles', {
      method: 'POST',
      body: JSON.stringify(cycleData),
    });
  },

  async updateCycle(cycleId, cycleData) {
    return request(`/cycles/${cycleId}`, {
      method: 'PUT',
      body: JSON.stringify(cycleData),
    });
  },

  async deleteCycle(cycleId) {
    return request(`/cycles/${cycleId}`, {
      method: 'DELETE',
    });
  },

  async logCycleFlow({ startDate, flow, optionalMood, optionalSymptoms }) {
    return request('/cycles/flow', {
      method: 'POST',
      body: JSON.stringify({
        startDate,
        flow,
        optionalMood,
        optionalSymptoms,
      }),
    });
  },

  async deleteCycleFlow(cycleId, flowDate) {
    return request(`/cycles/${cycleId}/flow/${flowDate}`, {
      method: 'DELETE',
    });
  },

  // --- SYMPTOMS ---
  async getSymptoms() {
    return request('/symptoms');
  },

  async addSymptom({ symptomName, category, severity, notes }) {
    return request('/symptoms', {
      method: 'POST',
      body: JSON.stringify({
        symptomName,
        category,
        severity,
        notes,
      }),
    });
  },

  async updateSymptom(symptomId, { severity, notes }) {
    return request(`/symptoms/${symptomId}`, {
      method: 'PUT',
      body: JSON.stringify({
        severity,
        notes,
      }),
    });
  },

  async deleteSymptom(symptomId) {
    return request(`/symptoms/${symptomId}`, {
      method: 'DELETE',
    });
  },

  // --- MOODS ---
  async getMoods() {
    return request('/moods');
  },

  async addMood(moodObj, note = '') {
    return request('/moods', {
      method: 'POST',
      body: JSON.stringify({
        moodObj,
        note,
      }),
    });
  },

  async deleteMood(moodId) {
    return request(`/moods/${moodId}`, {
      method: 'DELETE',
    });
  },

  // --- SLEEP LOGS ---
  async getSleepLogs() {
    return request('/sleep');
  },

  async addSleepLog(sleepData) {
    return request('/sleep', {
      method: 'POST',
      body: JSON.stringify(sleepData),
    });
  },

  async deleteSleepLog(sleepId) {
    return request(`/sleep/${sleepId}`, {
      method: 'DELETE',
    });
  },

  // --- MEDICATIONS ---
  async getMedications() {
    return request('/medications');
  },

  async addMedication(medData) {
    return request('/medications', {
      method: 'POST',
      body: JSON.stringify(medData),
    });
  },

  async deleteMedication(medId) {
    return request(`/medications/${medId}`, {
      method: 'DELETE',
    });
  },

  // --- ACTIVITY & LIFESTYLE ---
  async getActivityLogs() {
    return request('/activity');
  },

  async addActivityLog(activityData) {
    return request('/activity', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  // --- HYDRATION ---
  async getHydration() {
    return request('/hydration');
  },

  async addHydration(mlAmount = 250) {
    return request('/hydration/add', {
      method: 'POST',
      body: JSON.stringify({
        mlAmount,
      }),
    });
  },

  // --- CIRCLE CARE (PARTNER & FAMILY SYNC) ---
  async getCircleMembers() {
    return request('/circle-care');
  },

  async inviteCircleMember({ name, role, email, permissions }) {
    return request('/circle-care/invite', {
      method: 'POST',
      body: JSON.stringify({
        name,
        role,
        email,
        permissions,
      }),
    });
  },

  async respondToCircleShare(memberId, action) {
    return request(`/circle-care/${memberId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async revokeCircleShare(memberId) {
    return request(`/circle-care/${memberId}/revoke`, {
      method: 'POST',
    });
  },

  async getSharedWithMe() {
    return request('/circle-care/shared-with-me');
  },

  async updateMemberPermissions(memberId, permissions) {
    return request(`/circle-care/${memberId}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({
        permissions,
      }),
    });
  },

  async deleteCircleMember(memberId) {
    return request(`/circle-care/${memberId}`, {
      method: 'DELETE',
    });
  },

  // --- IN-APP NOTIFICATIONS ---
  async getNotifications() {
    return request('/notifications');
  },

  async markNotificationRead(notificationId) {
    return request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return request('/notifications/read-all', {
      method: 'POST',
    });
  },

  async deleteNotification(notificationId) {
    return request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // --- NEARBY CLINICS & DOCTORS ---
  async getNearbyClinics({ latitude, longitude, query, radiusKm = 15, facilityType = 'all' } = {}) {
    const params = new URLSearchParams();
    if (latitude != null) params.append('latitude', latitude);
    if (longitude != null) params.append('longitude', longitude);
    if (query) params.append('query', query);
    if (radiusKm != null) params.append('radius_km', radiusKm);
    if (facilityType) params.append('facility_type', facilityType);

    const queryStr = params.toString();
    return request(`/clinics/nearby${queryStr ? `?${queryStr}` : ''}`);
  },

  // --- FEEDBACK & REVIEWS ---
  async getMyFeedback() {
    return request('/feedback/my');
  },

  async submitFeedback(feedbackData) {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // --- SPECIAL HEALTH CONDITIONS (PCOD/PCOS & MIGRAINE) ---
  async getMigraineLogs() {
    return request('/conditions/migraine');
  },

  async addMigraineLog(migraineData) {
    return request('/conditions/migraine', {
      method: 'POST',
      body: JSON.stringify(migraineData),
    });
  },

  async updateMigraineLog(logId, migraineData) {
    return request(`/conditions/migraine/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(migraineData),
    });
  },

  async deleteMigraineLog(logId) {
    return request(`/conditions/migraine/${logId}`, {
      method: 'DELETE',
    });
  },

  async getPcodLogs() {
    return request('/conditions/pcod');
  },

  async addPcodLog(pcodData) {
    return request('/conditions/pcod', {
      method: 'POST',
      body: JSON.stringify(pcodData),
    });
  },

  async updatePcodLog(logId, pcodData) {
    return request(`/conditions/pcod/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(pcodData),
    });
  },

  async deletePcodLog(logId) {
    return request(`/conditions/pcod/${logId}`, {
      method: 'DELETE',
    });
  },

  async updateConditionPreferences({ trackPcod, trackMigraine }) {
    return request('/conditions/preferences', {
      method: 'PUT',
      body: JSON.stringify({ trackPcod, trackMigraine }),
    });
  },

  async getConditionsSummary() {
    return request('/conditions/summary');
  },

  // --- SYMPTOM-BASED PREDICTIONS & INSIGHTS ---
  async getPredictionInsights() {
    return request('/predictions/insights');
  },

  // --- SMART HEALTH ALERTS ---
  async getSmartHealthAlerts() {
    return request('/predictions/smart-alerts');
  },

  // --- HEALTH CHECK ---
  async checkHealth() {
    return request('/health');
  },
};

export default api;
