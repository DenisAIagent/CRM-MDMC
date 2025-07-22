import React, { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  // Test d'authentification
  useEffect(() => {
    fetch('http://localhost:5001/api/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated || false);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Connexion Google
  const handleGoogleLogin = () => {
    fetch('http://localhost:5001/api/auth/google/url')
      .then(res => res.json())
      .then(data => {
        if (data.authUrl) {
          window.location.href = data.authUrl;
        }
      })
      .catch(err => console.error('Erreur:', err));
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #0284c7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ 
          maxWidth: '28rem', 
          width: '100%', 
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ 
                fontSize: '48px', 
                margin: '0',
                color: '#0284c7'
              }}>🎵</h1>
            </div>
            <h2 style={{ 
              marginTop: '24px', 
              fontSize: '30px', 
              fontWeight: '800', 
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              CRM MDMC Music Ads
            </h2>
            <p style={{ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#6b7280',
              margin: '0 0 32px 0'
            }}>
              Connectez-vous avec votre compte Google Workspace
            </p>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12px 16px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              color: 'white',
              backgroundColor: '#0284c7',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0369a1'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0284c7'}
          >
            <svg style={{ width: '20px', height: '20px', marginRight: '12px' }} viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Interface principale simplifiée
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ 
            margin: '0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827'
          }}>
            🎵 CRM MDMC Music Ads
          </h1>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setCurrentView('dashboard')}
              style={{
                padding: '8px 16px',
                border: currentView === 'dashboard' ? '2px solid #0284c7' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentView === 'dashboard' ? '#e0f2fe' : 'white',
                color: currentView === 'dashboard' ? '#0284c7' : '#374151',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('clients')}
              style={{
                padding: '8px 16px',
                border: currentView === 'clients' ? '2px solid #0284c7' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentView === 'clients' ? '#e0f2fe' : 'white',
                color: currentView === 'clients' ? '#0284c7' : '#374151',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              👥 Clients
            </button>
            <button 
              onClick={() => setCurrentView('emails')}
              style={{
                padding: '8px 16px',
                border: currentView === 'emails' ? '2px solid #0284c7' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentView === 'emails' ? '#e0f2fe' : 'white',
                color: currentView === 'emails' ? '#0284c7' : '#374151',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📧 Emails
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '24px' }}>
        {currentView === 'dashboard' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#111827' }}>
              📊 Tableau de bord
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Total Clients</h3>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#111827' }}>2</p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Clients Actifs</h3>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#059669' }}>1</p>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>Opportunités</h3>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#d97706' }}>1</p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>
                Clients récents
              </h3>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <p>🎸 Sidilarsen - Rock (Client actif)</p>
                <p>🎤 Ayo - R&B (Prospect)</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'clients' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#111827' }}>
              👥 Gestion des clients
            </h2>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <button style={{
                  padding: '10px 20px',
                  backgroundColor: '#0284c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  + Nouveau client
                </button>
              </div>
              
              <div style={{ fontSize: '14px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                  gap: '16px',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <div>Nom</div>
                  <div>Email</div>
                  <div>Genre</div>
                  <div>Statut</div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                  gap: '16px',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontWeight: '500' }}>Sidilarsen</div>
                  <div style={{ color: '#6b7280' }}>contact@sidilarsen.com</div>
                  <div><span style={{ 
                    padding: '2px 8px', 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>Rock</span></div>
                  <div><span style={{ 
                    padding: '2px 8px', 
                    backgroundColor: '#dcfce7', 
                    color: '#166534',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>Client actif</span></div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                  gap: '16px',
                  padding: '12px 0'
                }}>
                  <div style={{ fontWeight: '500' }}>Ayo</div>
                  <div style={{ color: '#6b7280' }}>ayo@management.com</div>
                  <div><span style={{ 
                    padding: '2px 8px', 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>R&B</span></div>
                  <div><span style={{ 
                    padding: '2px 8px', 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>Prospect</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'emails' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#111827' }}>
              📧 Interface emails
            </h2>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>
                Opportunité détectée par IA
              </h3>
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#92400e' }}>
                  🎯 Sidilarsen - Campagne publicitaire
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
                  "Nous aimerions lancer une campagne de promotion pour notre nouveau single. Quel budget faut-il prévoir ?"
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#92400e' }}>
                  Score IA: 85% - Mots-clés: campagne, promotion, budget
                </p>
              </div>
              
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                📧 Répondre avec IA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;