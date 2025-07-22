import React, { useState, useEffect } from 'react';
import { Send, RefreshCw, Sparkles, Eye, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema, ValidationUtils } from '../utils/validation';
import apiService from '../services/api';

export function EmailInterface({ selectedClient, onClientChange }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suggestedResponse, setSuggestedResponse] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: selectedClient?.email || '',
      subject: '',
      body: ''
    }
  });

  // Mettre à jour le destinataire quand le client change
  useEffect(() => {
    if (selectedClient) {
      setValue('to', selectedClient.email);
      loadClientEmails(selectedClient._id);
    }
  }, [selectedClient, setValue]);

  // Charger les emails d'un client
  const loadClientEmails = async (clientId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getClientEmails(clientId);
      
      if (response.success) {
        setEmails(response.emails || []);
        if (response.newOpportunities > 0) {
          setSuccess(`${response.newOpportunities} nouvelle(s) opportunité(s) détectée(s) !`);
        }
      }
    } catch (error) {
      console.error('Erreur chargement emails:', error);
      setError('Erreur lors du chargement des emails');
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser tous les emails
  const handleSyncEmails = async () => {
    try {
      setSyncLoading(true);
      setError('');
      
      const response = await apiService.syncAllEmails();
      
      if (response.success) {
        setSuccess(`Synchronisation terminée: ${response.stats.emailsProcessed} emails traités, ${response.stats.newOpportunities} nouvelles opportunités`);
        
        // Recharger les emails du client actuel
        if (selectedClient) {
          await loadClientEmails(selectedClient._id);
        }
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      setError('Erreur lors de la synchronisation des emails');
    } finally {
      setSyncLoading(false);
    }
  };

  // Envoyer un email
  const handleSendEmail = async (data) => {
    try {
      setSendLoading(true);
      setError('');
      
      const emailData = {
        ...data,
        clientId: selectedClient?._id
      };

      const response = await apiService.sendEmail(emailData);
      
      if (response.success) {
        setSuccess('Email envoyé avec succès !');
        reset({
          to: selectedClient?.email || '',
          subject: '',
          body: ''
        });
        setSuggestedResponse('');
        
        // Recharger les emails
        if (selectedClient) {
          await loadClientEmails(selectedClient._id);
        }
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendLoading(false);
    }
  };

  // Générer une réponse automatique
  const handleGenerateResponse = async (emailContent) => {
    try {
      setError('');
      
      const response = await apiService.generateEmailResponse(
        emailContent,
        selectedClient?.nom || 'Client'
      );
      
      if (response.success) {
        setSuggestedResponse(response.suggestedResponse);
      }
    } catch (error) {
      console.error('Erreur génération réponse:', error);
      setError('Erreur lors de la génération de la réponse');
    }
  };

  // Utiliser la réponse suggérée
  const handleUseSuggestedResponse = () => {
    setValue('body', suggestedResponse);
    setSuggestedResponse('');
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Badge d'opportunité
  const getOpportunityBadge = (email) => {
    if (!email.gemini_analyse?.opportunite_detectee) return null;
    
    const confidence = email.gemini_analyse.confidence_score;
    const badgeClass = confidence >= 70 ? 'badge-red' : confidence >= 50 ? 'badge-yellow' : 'badge-blue';
    
    return (
      <span className={`badge ${badgeClass}`}>
        Opportunité {confidence}%
      </span>
    );
  };

  if (!selectedClient) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sélectionnez un client pour voir ses emails</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Emails - {selectedClient.nom}
              </h2>
              <p className="text-sm text-gray-500">{selectedClient.email}</p>
            </div>
            <button
              onClick={handleSyncEmails}
              disabled={syncLoading}
              className="btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
              {syncLoading ? 'Synchronisation...' : 'Synchroniser'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages de retour */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3 text-sm text-green-700">{success}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des emails */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-md font-medium text-gray-900">
              Historique des emails ({emails.length})
            </h3>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mdmc-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Chargement...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Aucun email trouvé</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <div className="divide-y divide-gray-200">
                  {emails.map((email) => (
                    <div
                      key={email._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedEmail?._id === email._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {email.sujet || 'Sans sujet'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            De: {email.expediteur}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(email.date_envoi)}
                          </span>
                          {getOpportunityBadge(email)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {email.gemini_analyse?.resume_contenu || 
                         email.contenu?.substring(0, 100) + '...' || 
                         'Contenu non disponible'}
                      </p>
                      {email.gemini_analyse?.mots_cles_detectes?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {email.gemini_analyse.mots_cles_detectes.slice(0, 3).map((motCle, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {motCle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Envoi d'email */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-md font-medium text-gray-900">Envoyer un email</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(handleSendEmail)} className="space-y-4">
              {/* Destinataire */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Destinataire
                </label>
                <input
                  type="email"
                  {...register('to')}
                  className="form-input"
                  readOnly
                />
                {errors.to && (
                  <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>
                )}
              </div>

              {/* Sujet */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sujet
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  className="form-input"
                  placeholder="Objet de votre email"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              {/* Réponse suggérée */}
              {selectedEmail && (
                <div>
                  <button
                    type="button"
                    onClick={() => handleGenerateResponse(selectedEmail.contenu)}
                    className="btn-secondary mb-2"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer une réponse IA
                  </button>
                  
                  {suggestedResponse && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-blue-900">
                          Réponse suggérée par IA
                        </h4>
                        <button
                          type="button"
                          onClick={handleUseSuggestedResponse}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Utiliser
                        </button>
                      </div>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {suggestedResponse}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Corps du message */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  {...register('body')}
                  rows={6}
                  className="form-textarea"
                  placeholder="Votre message..."
                />
                {errors.body && (
                  <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  La signature MDMC sera automatiquement ajoutée
                </p>
              </div>

              {/* Bouton d'envoi */}
              <button
                type="submit"
                disabled={sendLoading}
                className="w-full btn-primary"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendLoading ? 'Envoi en cours...' : 'Envoyer l\'email'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Détail de l'email sélectionné */}
      {selectedEmail && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">
                Détails de l'email
              </h3>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Sujet:</h4>
                <p className="text-sm text-gray-700">{selectedEmail.sujet || 'Sans sujet'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">De:</h4>
                  <p className="text-sm text-gray-700">{selectedEmail.expediteur}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Date:</h4>
                  <p className="text-sm text-gray-700">{formatDate(selectedEmail.date_envoi)}</p>
                </div>
              </div>

              {selectedEmail.gemini_analyse?.opportunite_detectee && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Analyse IA - Opportunité détectée ({selectedEmail.gemini_analyse.confidence_score}%)
                  </h4>
                  <p className="text-sm text-yellow-800">
                    {selectedEmail.gemini_analyse.resume_contenu}
                  </p>
                  {selectedEmail.gemini_analyse.mots_cles_detectes?.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-yellow-700">Mots-clés détectés: </span>
                      {selectedEmail.gemini_analyse.mots_cles_detectes.join(', ')}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-900">Contenu:</h4>
                <div className="mt-2 bg-gray-50 rounded-md p-3 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedEmail.contenu || 'Contenu non disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}