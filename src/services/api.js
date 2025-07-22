const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Méthodes génériques
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      ...options,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // === AUTHENTIFICATION ===
  async getAuthUrl() {
    return this.get('/auth/google/url');
  }

  async handleGoogleCallback(code) {
    return this.post('/auth/google/callback', { code });
  }

  async getAuthStatus() {
    return this.get('/auth/status');
  }

  async logout() {
    return this.post('/auth/logout');
  }

  // === CLIENTS ===
  async getClients(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.get(`/clients?${searchParams}`);
  }

  async getClient(id) {
    return this.get(`/clients/${id}`);
  }

  async createClient(clientData) {
    return this.post('/clients', clientData);
  }

  async updateClient(id, clientData) {
    return this.put(`/clients/${id}`, clientData);
  }

  async deleteClient(id) {
    return this.delete(`/clients/${id}`);
  }

  async getClientStats() {
    return this.get('/clients/stats/overview');
  }

  // === EMAILS ===
  async getClientEmails(clientId) {
    return this.get(`/emails/client/${clientId}`);
  }

  async getEmails(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.get(`/emails?${searchParams}`);
  }

  async sendEmail(emailData) {
    return this.post('/emails/send', emailData);
  }

  async syncAllEmails() {
    return this.post('/emails/sync-all');
  }

  async generateEmailResponse(emailContent, clientName) {
    return this.post('/emails/generate-response', {
      emailContent,
      clientName
    });
  }

  async summarizeEmail(emailContent) {
    return this.post('/emails/summarize', { emailContent });
  }

  // === OPPORTUNITÉS ===
  async getOpportunities(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.get(`/opportunities?${searchParams}`);
  }

  async getOpportunity(id) {
    return this.get(`/opportunities/${id}`);
  }

  async createOpportunity(opportunityData) {
    return this.post('/opportunities', opportunityData);
  }

  async updateOpportunity(id, opportunityData) {
    return this.put(`/opportunities/${id}`, opportunityData);
  }

  async updateOpportunityStatus(id, status) {
    return this.patch(`/opportunities/${id}/status`, { statut: status });
  }

  async deleteOpportunity(id) {
    return this.delete(`/opportunities/${id}`);
  }

  async getOpportunityStats() {
    return this.get('/opportunities/stats/overview');
  }

  async getRecentOpportunities() {
    return this.get('/opportunities/recent/week');
  }

  // === SANTÉ DE L'API ===
  async getHealth() {
    return this.get('/health');
  }
}

// Instance singleton
const apiService = new ApiService();

export default apiService;