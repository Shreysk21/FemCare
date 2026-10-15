// Centralized API Client Service for FemCare
// Integrates React frontend with FastAPI backend & Supabase/PostgreSQL database

const BASE_URL = '/api';

/**
 * Generic request helper with automatic JSON parsing and robust error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
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

  // --- HEALTH CHECK ---
  async checkHealth() {
    return request('/health');
  },
};

export default api;
