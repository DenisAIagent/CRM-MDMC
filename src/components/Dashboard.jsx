import React, { useState, useEffect } from 'react';
import { Users, Mail, Target, TrendingUp, AlertCircle, Calendar, Music, Eye } from 'lucide-react';
import apiService from '../services/api';

export function Dashboard({ onClientSelect, onOpportunitySelect }) {
  const [stats, setStats] = useState({
    clients: null,
    opportunities: null
  });
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les données du dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger les statistiques en parallèle
      const [clientStats, opportunityStats, recentOpps] = await Promise.all([
        apiService.getClientStats(),
        apiService.getOpportunityStats(),
        apiService.getRecentOpportunities()
      ]);

      setStats({
        clients: clientStats.success ? clientStats.stats : null,
        opportunities: opportunityStats.success ? opportunityStats.stats : null
      });

      setRecentOpportunities(recentOpps.success ? recentOpps.opportunities : []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Formater les nombres
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Calcul du taux de conversion
  const getConversionRate = () => {
    if (!stats.clients) return 0;
    const total = stats.clients.total;
    const actifs = stats.clients.clientsActifs;
    return total > 0 ? Math.round((actifs / total) * 100) : 0;
  };

  // Badge de statut d'opportunité
  const getOpportunityStatusBadge = (statut) => {
    const badges = {
      nouveau: 'badge badge-blue',
      en_cours: 'badge badge-yellow',
      qualifie: 'badge badge-green',
      perdu: 'badge badge-red'
    };
    
    const labels = {
      nouveau: 'Nouveau',
      en_cours: 'En cours',
      qualifie: 'Qualifié',
      perdu: 'Perdu'
    };

    return (
      <span className={badges[statut] || 'badge badge-gray'}>
        {labels[statut] || statut}
      </span>
    );
  };

  // Badge de genre musical
  const getGenreBadge = (genre) => {
    return (
      <span className="badge badge-blue">
        <Music className="h-3 w-3 mr-1" />
        {genre}
      </span>
    );
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-body">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mdmc-600"></div>
              <span className="ml-3 text-gray-600">Chargement du tableau de bord...</span>
            </div>
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
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de bord CRM
              </h1>
              <p className="text-sm text-gray-500">
                Vue d'ensemble de votre activité MDMC Music Ads
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total clients */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-mdmc-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.clients?.total)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Clients actifs */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clients Actifs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.clients?.clientsActifs)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunités */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Opportunités
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.opportunities?.total)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Newsletter
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.clients?.newsletterAbonnes)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des clients */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Répartition des clients
            </h3>
          </div>
          <div className="card-body">
            {stats.clients ? (
              <div className="space-y-4">
                {/* Par statut */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Par statut</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prospects</span>
                      <span className="badge badge-yellow">
                        {formatNumber(stats.clients.prospects)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Clients actifs</span>
                      <span className="badge badge-green">
                        {formatNumber(stats.clients.clientsActifs)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Anciens clients</span>
                      <span className="badge badge-gray">
                        {formatNumber(stats.clients.anciensClients)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Taux de conversion */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Taux de conversion
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {getConversionRate()}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getConversionRate()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Données non disponibles</p>
            )}
          </div>
        </div>

        {/* Répartition par genre musical */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Genres musicaux
            </h3>
          </div>
          <div className="card-body">
            {stats.clients?.genreMusical ? (
              <div className="space-y-2">
                {stats.clients.genreMusical
                  .sort((a, b) => b.count - a.count)
                  .map((genre) => (
                    <div key={genre._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {genre._id || 'Non défini'}
                      </span>
                      <span className="badge badge-blue">
                        {formatNumber(genre.count)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">Données non disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Opportunités récentes */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Opportunités récentes ({recentOpportunities.length})
            </h3>
            <span className="text-sm text-gray-500">
              <Calendar className="h-4 w-4 inline mr-1" />
              7 derniers jours
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          {recentOpportunities.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Aucune opportunité récente</p>
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
                      Opportunité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score IA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOpportunities.map((opportunity) => (
                    <tr key={opportunity._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.client_id?.nom || 'Client inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {opportunity.client_id?.email}
                          </div>
                          {opportunity.client_id?.genre_musical && (
                            <div className="mt-1">
                              {getGenreBadge(opportunity.client_id.genre_musical)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {opportunity.titre}
                        </div>
                        {opportunity.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {opportunity.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getOpportunityStatusBadge(opportunity.statut)}
                      </td>
                      <td className="px-6 py-4">
                        {opportunity.email_source_id?.gemini_analyse?.confidence_score ? (
                          <span className="text-sm font-medium text-gray-900">
                            {opportunity.email_source_id.gemini_analyse.confidence_score}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(opportunity.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => onOpportunitySelect?.(opportunity)}
                          className="text-mdmc-600 hover:text-mdmc-900"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}