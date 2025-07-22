const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

console.log('🚀 Démarrage du serveur backend CRM MDMC');
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🚪 PORT:', PORT);

// Configuration CORS pour production
const corsOptions = {
  origin: [
    'https://crm-mdmc-frontend-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Route healthcheck
app.get('/health', (req, res) => {
  console.log('💓 Backend healthcheck appelé');
  res.status(200).json({
    status: 'ok',
    service: 'mdmc-backend',
    timestamp: new Date().toISOString(),
    port: PORT,
    version: '1.0.0'
  });
});

// Routes API de base
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mdmc-backend-api',
    timestamp: new Date().toISOString()
  });
});

// Routes auth mockées pour commencer
app.get('/api/auth/status', (req, res) => {
  console.log('🔐 Auth status check');
  res.status(200).json({
    authenticated: false,
    user: null
  });
});

app.get('/api/auth/google/url', (req, res) => {
  console.log('🔗 Google auth URL request');
  res.status(200).json({
    url: 'https://accounts.google.com/oauth/authorize?client_id=mockid&redirect_uri=mock'
  });
});

app.post('/api/auth/google/callback', (req, res) => {
  console.log('📞 Google auth callback');
  res.status(200).json({
    success: true,
    user: { name: 'Test User', email: 'test@example.com' }
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('👋 Logout request');
  res.status(200).json({ success: true });
});

// Routes clients mockées
app.get('/api/clients', (req, res) => {
  console.log('📋 Get clients');
  res.status(200).json([]);
});

app.get('/api/clients/stats/overview', (req, res) => {
  console.log('📊 Get client stats');
  res.status(200).json({
    total: 0,
    active: 0,
    inactive: 0
  });
});

// Routes emails mockées
app.get('/api/emails', (req, res) => {
  console.log('📧 Get emails');
  res.status(200).json([]);
});

// Routes opportunities mockées
app.get('/api/opportunities', (req, res) => {
  console.log('💼 Get opportunities');
  res.status(200).json([]);
});

app.get('/api/opportunities/stats/overview', (req, res) => {
  console.log('📊 Get opportunity stats');
  res.status(200).json({
    total: 0,
    won: 0,
    lost: 0,
    pending: 0
  });
});

app.get('/api/opportunities/recent/week', (req, res) => {
  console.log('📅 Get recent opportunities');
  res.status(200).json([]);
});

// Route catch-all pour API
app.use('/api/*', (req, res) => {
  console.log(`❓ API route non trouvée: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'API endpoint not found',
    method: req.method,
    path: req.path
  });
});

// Gestion d'erreurs
app.use((error, req, res, next) => {
  console.error('💥 Erreur serveur:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Démarrage du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Serveur backend MDMC démarré');
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`💓 Healthcheck: http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 API: http://0.0.0.0:${PORT}/api/health`);
});

server.on('error', (error) => {
  console.error('💥 ERREUR SERVEUR:', error);
  process.exit(1);
});

// Gestion graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM reçu, fermeture...');
  server.close(() => {
    console.log('✅ Serveur fermé proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT reçu, fermeture...');
  server.close(() => {
    console.log('✅ Serveur fermé proprement');
    process.exit(0);
  });
});