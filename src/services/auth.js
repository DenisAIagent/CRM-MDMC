import apiService from './api';

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.listeners = [];
  }

  // Ajouter un listener pour les changements d'état d'auth
  addAuthListener(callback) {
    this.listeners.push(callback);
  }

  // Supprimer un listener
  removeAuthListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback({
      isAuthenticated: this.isAuthenticated,
      user: this.user
    }));
  }

  // Initialiser l'authentification au démarrage
  async initialize() {
    try {
      const response = await apiService.getAuthStatus();
      this.isAuthenticated = response.authenticated || false;
      this.notifyListeners();
      return this.isAuthenticated;
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
      this.isAuthenticated = false;
      this.notifyListeners();
      return false;
    }
  }

  // Obtenir l'URL d'authentification Google
  async getGoogleAuthUrl() {
    try {
      const response = await apiService.getAuthUrl();
      return response.authUrl;
    } catch (error) {
      console.error('Erreur obtention URL auth:', error);
      throw error;
    }
  }

  // Gérer le callback de Google OAuth
  async handleGoogleCallback(code) {
    try {
      const response = await apiService.handleGoogleCallback(code);
      
      if (response.success) {
        this.isAuthenticated = true;
        this.user = response.user || null;
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur callback Google:', error);
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      await apiService.logout();
      this.isAuthenticated = false;
      this.user = null;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      // Même en cas d'erreur, on déconnecte côté client
      this.isAuthenticated = false;
      this.user = null;
      this.notifyListeners();
      throw error;
    }
  }

  // Vérifier si l'utilisateur est connecté
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user
    };
  }

  // Redirection vers l'authentification Google
  redirectToGoogle() {
    this.getGoogleAuthUrl()
      .then(authUrl => {
        window.location.href = authUrl;
      })
      .catch(error => {
        console.error('Erreur redirection Google:', error);
        throw error;
      });
  }

  // Méthode pour obtenir l'état actuel
  getCurrentState() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user
    };
  }
}

// Instance singleton
const authService = new AuthService();

export default authService;