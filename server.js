const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4173;

// Log de démarrage pour debug
console.log(`🚀 Démarrage du serveur frontend sur le port ${PORT}`);
console.log(`📁 Répertoire dist: ${path.join(__dirname, 'dist')}`);

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route healthcheck CRITIQUE
app.get('/health', (req, res) => {
  console.log('💓 Healthcheck appelé');
  res.status(200).json({ 
    status: 'ok', 
    service: 'mdmc-frontend',
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Servir les assets statiques
app.use(express.static(path.join(__dirname, 'dist'), {
  etag: false,
  lastModified: false
}));

// Fallback pour React Router (SPA)
app.get('*', (req, res) => {
  console.log(`📄 Serving SPA for: ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend MDMC démarré sur 0.0.0.0:${PORT}`);
  console.log(`🔗 Healthcheck disponible sur: http://0.0.0.0:${PORT}/health`);
});