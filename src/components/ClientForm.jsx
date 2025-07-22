import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, ValidationUtils } from '../utils/validation';
import { Save, X, AlertCircle } from 'lucide-react';

export function ClientForm({ onSubmit, initialData = null, onCancel, isLoading = false }) {
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      nom: '',
      email: '',
      telephone: '',
      genre_musical: 'pop',
      reseaux_sociaux: {
        instagram: '',
        spotify: '',
        youtube: ''
      },
      newsletter_inscrit: false,
      statut: 'prospect',
      tags: []
    }
  });

  const handleFormSubmit = async (data) => {
    try {
      setSubmitError('');
      
      // Nettoyage et validation des données
      const sanitizedData = ValidationUtils.sanitizeClientData(data);
      const validation = ValidationUtils.validateClientData(sanitizedData);
      
      if (!validation.success) {
        const errorMessages = ValidationUtils.formatValidationErrors(validation.errors);
        setSubmitError(errorMessages.join(', '));
        return;
      }

      await onSubmit(validation.data);
      
      // Reset du formulaire si c'est une création (pas d'initialData)
      if (!initialData) {
        reset();
      }
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
      setSubmitError(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?')) {
        reset();
        onCancel?.();
      }
    } else {
      onCancel?.();
    }
  };

  const genresMusical = [
    { value: 'rap', label: 'Rap' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'électro', label: 'Électro' },
    { value: 'r&b', label: 'R&B' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'autre', label: 'Autre' }
  ];

  const statutsClient = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'client_actif', label: 'Client actif' },
    { value: 'ancien_client', label: 'Ancien client' }
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Affichage des erreurs globales */}
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur de validation
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {submitError}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Nom */}
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nom"
            {...register('nom')}
            className="form-input"
            placeholder="Nom de l'artiste ou du label"
          />
          {errors.nom && (
            <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="form-input"
            placeholder="contact@exemple.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            type="tel"
            id="telephone"
            {...register('telephone')}
            className="form-input"
            placeholder="06 12 34 56 78"
          />
          {errors.telephone && (
            <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
          )}
        </div>

        {/* Genre musical */}
        <div>
          <label htmlFor="genre_musical" className="block text-sm font-medium text-gray-700">
            Genre musical <span className="text-red-500">*</span>
          </label>
          <select
            id="genre_musical"
            {...register('genre_musical')}
            className="form-select"
          >
            {genresMusical.map(genre => (
              <option key={genre.value} value={genre.value}>
                {genre.label}
              </option>
            ))}
          </select>
          {errors.genre_musical && (
            <p className="mt-1 text-sm text-red-600">{errors.genre_musical.message}</p>
          )}
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Réseaux sociaux</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="url"
              id="instagram"
              {...register('reseaux_sociaux.instagram')}
              className="form-input"
              placeholder="https://instagram.com/..."
            />
            {errors.reseaux_sociaux?.instagram && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reseaux_sociaux.instagram.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="spotify" className="block text-sm font-medium text-gray-700">
              Spotify
            </label>
            <input
              type="url"
              id="spotify"
              {...register('reseaux_sociaux.spotify')}
              className="form-input"
              placeholder="https://open.spotify.com/..."
            />
            {errors.reseaux_sociaux?.spotify && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reseaux_sociaux.spotify.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
              YouTube
            </label>
            <input
              type="url"
              id="youtube"
              {...register('reseaux_sociaux.youtube')}
              className="form-input"
              placeholder="https://youtube.com/..."
            />
            {errors.reseaux_sociaux?.youtube && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reseaux_sociaux.youtube.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Options supplémentaires */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Newsletter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="newsletter_inscrit"
            {...register('newsletter_inscrit')}
            className="form-checkbox"
          />
          <label htmlFor="newsletter_inscrit" className="ml-3 text-sm font-medium text-gray-700">
            Inscrit à la newsletter
          </label>
        </div>

        {/* Statut (seulement si on modifie un client existant) */}
        {initialData && (
          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="statut"
              {...register('statut')}
              className="form-select"
            >
              {statutsClient.map(statut => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={isSubmitting || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting || isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </form>
  );
}