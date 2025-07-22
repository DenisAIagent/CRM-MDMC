import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Eye, Filter, Download } from 'lucide-react';
import apiService from '../services/api';

export function ClientList({ onClientSelect, onClientEdit, onClientCreate }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre_musical: '',
    statut: '',
    newsletter_inscrit: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Charger les clients
  const loadClients = async (page = 1, resetList = false) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await apiService.getClients(params);
      
      if (response.success) {
        if (resetList || page === 1) {
          setClients(response.clients);
        } else {
          setClients(prev => [...prev, ...response.clients]);
        }
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      setError('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour le chargement initial
  useEffect(() => {
    loadClients(1, true);
  }, [searchTerm, filters]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadClients(1, true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Supprimer un client
  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?`)) {
      try {
        await apiService.deleteClient(clientId);
        setClients(prev => prev.filter(client => client._id !== clientId));
      } catch (error) {
        console.error('Erreur suppression client:', error);
        setError('Erreur lors de la suppression du client');
      }
    }
  };

  // Charger plus de résultats
  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      loadClients(pagination.page + 1, false);
    }
  };

  // Reset des filtres
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      genre_musical: '',
      statut: '',
      newsletter_inscrit: ''
    });
  };

  // Badge de statut
  const getStatusBadge = (statut) => {
    const badges = {
      prospect: 'badge badge-yellow',
      client_actif: 'badge badge-green',
      ancien_client: 'badge badge-gray'
    };
    
    const labels = {
      prospect: 'Prospect',
      client_actif: 'Client actif',
      ancien_client: 'Ancien client'
    };

    return (
      <span className={badges[statut] || 'badge badge-gray'}>
        {labels[statut] || statut}
      </span>
    );
  };

  // Badge genre musical
  const getGenreBadge = (genre) => {
    const genreLabels = {
      rap: 'Rap',
      pop: 'Pop',
      rock: 'Rock',
      électro: 'Électro',
      'r&b': 'R&B',
      jazz: 'Jazz',
      autre: 'Autre'
    };

    return (
      <span className="badge badge-blue">
        {genreLabels[genre] || genre}
      </span>
    );
  };

  if (loading && clients.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mdmc-600"></div>
            <span className="ml-3 text-gray-600">Chargement des clients...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Clients ({pagination.total})
            </h2>
            <button
              onClick={onClientCreate}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              value={filters.genre_musical}
              onChange={(e) => setFilters(prev => ({ ...prev, genre_musical: e.target.value }))}
              className="form-select"
            >
              <option value="">Tous les genres</option>
              <option value="rap">Rap</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="électro">Électro</option>
              <option value="r&b">R&B</option>
              <option value="jazz">Jazz</option>
              <option value="autre">Autre</option>
            </select>

            <select
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="form-select"
            >
              <option value="">Tous les statuts</option>
              <option value="prospect">Prospects</option>
              <option value="client_actif">Clients actifs</option>
              <option value="ancien_client">Anciens clients</option>
            </select>

            <select
              value={filters.newsletter_inscrit}
              onChange={(e) => setFilters(prev => ({ ...prev, newsletter_inscrit: e.target.value }))}
              className="form-select"
            >
              <option value="">Newsletter</option>
              <option value="true">Inscrits</option>
              <option value="false">Non inscrits</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="btn-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Liste des clients */}
      <div className="card">
        <div className="card-body p-0">
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun client trouvé</p>
              {(searchTerm || Object.values(filters).some(f => f !== '')) && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 btn-secondary"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Newsletter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.email}
                          </div>
                          {client.telephone && (
                            <div className="text-sm text-gray-500">
                              {client.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getGenreBadge(client.genre_musical)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(client.statut)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${client.newsletter_inscrit ? 'badge-green' : 'badge-gray'}`}>
                          {client.newsletter_inscrit ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => onClientSelect?.(client)}
                            className="text-mdmc-600 hover:text-mdmc-900"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onClientEdit?.(client)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client._id, client.nom)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bouton charger plus */}
          {pagination.hasNext && (
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full btn-secondary"
              >
                {loading ? 'Chargement...' : `Charger plus (${pagination.total - clients.length} restants)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}