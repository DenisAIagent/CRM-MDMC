#!/usr/bin/env node

// Debug maximum pour Railway
console.log('🔥 === DÉMARRAGE SERVER FRONTEND ===');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🚪 PORT from env:', process.env.PORT);
console.log('📁 __dirname:', __dirname);
console.log('📂 process.cwd():', process.cwd());

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4173;

console.log('🎯 Port final choisi:', PORT);

// Vérifier que le dossier dist existe
const distPath = path.join(__dirname, 'dist');
console.log('📁 Chemin dist:', distPath);

try {
  const distExists = fs.existsSync(distPath);
  console.log('📂 Dossier dist existe:', distExists);
  
  if (distExists) {
    const files = fs.readdirSync(distPath);
    console.log('📄 Fichiers dans dist:', files);
  }
} catch (error) {
  console.error('❌ Erreur vérification dist:', error.message);
}

// Middleware de debug pour toutes les requêtes
app.use((req, res, next) => {
  console.log(`📞 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Route healthcheck avec debug maximal
app.get('/health', (req, res) => {
  console.log('💓 === HEALTHCHECK APPELÉ ===');
  console.log('🕐 Time:', new Date().toISOString());
  console.log('🔗 URL:', req.url);
  console.log('📡 Headers:', JSON.stringify(req.headers, null, 2));
  
  const healthData = {
    status: 'ok',
    service: 'mdmc-frontend',
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  console.log('📊 Health data:', JSON.stringify(healthData, null, 2));
  
  res.status(200).json(healthData);
  console.log('✅ Healthcheck response sent');
});

// Route de debug supplémentaire
app.get('/debug', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  });
});

// Servir les assets statiques avec options étendues
app.use(express.static(distPath, {
  etag: false,
  lastModified: false,
  maxAge: 0
}));

// Fallback pour React Router
app.get('*', (req, res) => {
  console.log(`📄 SPA fallback pour: ${req.path}`);
  const indexPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('❌ index.html non trouvé:', indexPath);
    res.status(404).send('index.html not found');
  }
});

// Gestion d'erreurs
app.use((error, req, res, next) => {
  console.error('💥 Erreur serveur:', error);
  res.status(500).json({ error: error.message });
});

// Démarrage avec gestion d'erreurs
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 === SERVEUR DÉMARRÉ AVEC SUCCÈS ===');
  console.log(`🌐 Adresse: http://0.0.0.0:${PORT}`);
  console.log(`💓 Healthcheck: http://0.0.0.0:${PORT}/health`);
  console.log(`🔧 Debug: http://0.0.0.0:${PORT}/debug`);
  console.log('⏰ Démarrage terminé à:', new Date().toISOString());
});

server.on('error', (error) => {
  console.error('💥 ERREUR SERVEUR:', error);
  process.exit(1);
});

// Gestion des signaux de fermeture
process.on('SIGTERM', () => {
  console.log('📴 Signal SIGTERM reçu, fermeture du serveur...');
  server.close(() => {
    console.log('✅ Serveur fermé proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Signal SIGINT reçu, fermeture du serveur...');
  server.close(() => {
    console.log('✅ Serveur fermé proprement');
    process.exit(0);
  });
});

console.log('🏁 Script serveur chargé, attente du démarrage...');