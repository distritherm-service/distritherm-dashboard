import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  ShoppingCart,
  AlertCircle,
  UserPlus,
  UserCog
} from 'lucide-react';
import { useQuotes } from '../hooks/useQuotes';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AssignCommercialModal from '../components/features/AssignCommercialModal';
import type { QuoteStatus } from '../types/quote';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../services/quoteService';

const Orders: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | ''>('');
  const { user } = useAuth();
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [currentCommercialId, setCurrentCommercialId] = useState<number | undefined>(undefined);
  
  // Hook de navigation
  const navigate = useNavigate();

  const { quotes, loading, error, meta, loadQuotes, calculateQuoteTotal, downloadQuoteFile, updateQuote } = useQuotes({
    page: currentPage,
    limit: 10,
    status: statusFilter || undefined
  });

  const { showSuccess, showError } = useToast();

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour formater un prix en euro (fr-FR)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status: QuoteStatus) => {
    switch (status) {
      case 'SENDED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'CONSULTED':
        return 'bg-indigo-100 text-indigo-800';
      
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: QuoteStatus) => {
    switch (status) {
      case 'SENDED':
        return 'Envoyé';
      case 'PENDING':
        return 'En attente';
      case 'PROGRESS':
        return 'En cours';
      case 'CONSULTED':
        return 'Consulté';
      default:
        return status;
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadQuotes({ page, limit: 10, status: statusFilter || undefined });
  };

  // Gérer le changement de filtre de statut
  const handleStatusFilterChange = (status: QuoteStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadQuotes({ page: 1, limit: 10, status: status || undefined });
  };

  // Filtrer les devis selon la recherche
  const filteredQuotes = quotes.filter(quote => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      quote.id.toString().includes(searchLower) ||
      quote.cart.user.firstName.toLowerCase().includes(searchLower) ||
      quote.cart.user.lastName.toLowerCase().includes(searchLower) ||
      quote.cart.user.email.toLowerCase().includes(searchLower) ||
      (quote.commercial && (
        quote.commercial.user.firstName.toLowerCase().includes(searchLower) ||
        quote.commercial.user.lastName.toLowerCase().includes(searchLower)
      ))
    );
  });

  const openAssignModal = (quoteId: number, currentId?: number) => {
    setSelectedQuoteId(quoteId);
    setCurrentCommercialId(currentId);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  const handleAssignCommercial = async (commercialId: number) => {
    if (!selectedQuoteId) return;
    
    console.log('🎯 DÉBUT ASSIGNATION');
    console.log('🎯 Quote ID:', selectedQuoteId);
    console.log('🎯 Nouveau Commercial ID:', commercialId);
    console.log('🎯 Commercial actuel:', currentCommercialId);
    
    // Trouver le devis actuel
    const currentQuote = quotes.find(q => q.id === selectedQuoteId);
    console.log('🎯 Devis actuel AVANT update:', currentQuote);
    console.log('🎯 Commercial actuel dans le devis:', currentQuote?.commercial);
     
    const success = await updateQuote(selectedQuoteId, { commercialId });
    
    console.log('🎯 Résultat update:', success);
    
    // Attendre un peu puis vérifier
    setTimeout(() => {
      const updatedQuote = quotes.find(q => q.id === selectedQuoteId);
      console.log('🎯 Devis APRÈS update (1s):', updatedQuote);
      console.log('🎯 Commercial après update:', updatedQuote?.commercial);
    }, 1000);
     
    if (success) {
      showSuccess('Commercial assigné avec succès');
      closeAssignModal();
    } else {
      showError('Erreur lors de l\'assignation du commercial');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">Demandes de devis reçus</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadQuotes({ page: currentPage, limit: 10, status: statusFilter || undefined })}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Rafraîchir
              </button>
                {import.meta.env.DEV && (
                  <>
                    <button
                      onClick={async () => {
                        // Tester avec un devis qui a déjà un commercial
                        const devisAvecCommercial = quotes.find(q => q.commercialId === 4);
                        if (devisAvecCommercial) {
                          console.log('🧪 Test: Changer commercial du devis', devisAvecCommercial.id);
                          console.log('🧪 Commercial actuel:', devisAvecCommercial.commercialId);
                          // Essayer d'assigner un commercial différent (ex: 5 ou 6)
                          const newCommercialId = devisAvecCommercial.commercialId === 4 ? 5 : 4;
                          console.log('🧪 Nouveau commercial:', newCommercialId);
                          const success = await updateQuote(devisAvecCommercial.id, { commercialId: newCommercialId });
                          if (success) {
                            showSuccess(`Commercial changé de ${devisAvecCommercial.commercialId} à ${newCommercialId}`);
                          }
                        }
                      }}
                      className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 rounded"
                    >
                      Test Changement
                    </button>
                    <button
                      onClick={async () => {
                        // Test direct avec fetch
                        const testId = 9; // ID du devis à tester
                        const testCommercialId = 5; // Nouveau commercial
                        console.log('🔬 TEST DIRECT FETCH');
                        try {
                          const token = localStorage.getItem('accessToken');
                          const response = await fetch(`https://distritherm-backend.onrender.com/devis/${testId}`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json',
                              'x-platform': 'web'  // Header requis par l'API
                            },
                            body: JSON.stringify({ commercialId: testCommercialId })
                          });
                          const data = await response.json();
                          console.log('🔬 Réponse:', data);
                          console.log('🔬 Status:', response.status);
                          console.log('🔬 Commercial dans réponse:', data.devis?.commercialId);
                          if (response.ok) {
                            showSuccess('Test direct réussi - Vérifiez les logs');
                            // Recharger la liste
                            setTimeout(() => {
                              loadQuotes({ page: currentPage, limit: 10 });
                            }, 500);
                          } else {
                            showError(`Erreur API: ${data.message || 'Erreur inconnue'}`);
                          }
                        } catch (error) {
                          console.error('🔬 Erreur test direct:', error);
                          showError('Erreur lors du test direct');
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                    >
                      Test Direct API
                    </button>
                    <button
                      onClick={async () => {
                        console.log('📋 Liste des commerciaux disponibles:');
                        try {
                          const token = localStorage.getItem('accessToken');
                          const response = await fetch('https://distritherm-backend.onrender.com/users/by-role?role=COMMERCIAL', {
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'x-platform': 'web'
                            }
                          });
                          const data = await response.json();
                          console.log('📋 Commerciaux:', data);
                          if (data.users) {
                            data.users.forEach((u: any) => {
                              console.log(`📋 - ID: ${u.id}, Nom: ${u.firstName} ${u.lastName}`);
                            });
                          }
                        } catch (error) {
                          console.error('📋 Erreur:', error);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 rounded"
                    >
                      Liste Commerciaux
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🧪 Test avec différents IDs');
                        const testDevisId = 9;
                        
                        // Essayer avec l'ID 4 (qui correspond à Pierre Dupont userId: 4)
                        console.log('🧪 Test 1: Assigner avec commercialId = 4 (userId de Pierre)');
                        try {
                          const result1 = await updateQuote(testDevisId, { commercialId: 4 });
                          console.log('🧪 Résultat test 1:', result1);
                        } catch (e) {
                          console.error('🧪 Erreur test 1:', e);
                        }
                        
                        // Essayer avec un autre ID pour voir
                        console.log('🧪 Test 2: Assigner avec commercialId = 5 (autre commercial?)');
                        try {
                          const result2 = await updateQuote(testDevisId, { commercialId: 5 });
                          console.log('🧪 Résultat test 2:', result2);
                        } catch (e) {
                          console.error('🧪 Erreur test 2:', e);
                        }
                        
                        // Recharger pour voir le résultat
                        setTimeout(() => {
                          loadQuotes({ page: currentPage, limit: 10 });
                        }, 1000);
                      }}
                      className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 rounded"
                    >
                      Test IDs
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🔧 Test update complet');
                        const testDevisId = 9;
                        const newCommercialId = 5;
                        
                        try {
                          const result = await quoteService.updateQuoteComplete(testDevisId, { 
                            commercialId: newCommercialId 
                          });
                          console.log('🔧 Résultat:', result);
                          
                          if (result.devis?.commercialId === newCommercialId) {
                            showSuccess('Update complet réussi!');
                          } else {
                            showError(`Commercial non mis à jour. Reste à ${result.devis?.commercialId}`);
                          }
                          
                          // Recharger
                          setTimeout(() => {
                            loadQuotes({ page: currentPage, limit: 10 });
                          }, 500);
                        } catch (error) {
                          console.error('🔧 Erreur:', error);
                          showError('Erreur lors de l\'update complet');
                        }
                      }}
                      className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 rounded"
                    >
                      Update Complet
                    </button>
                  </>
                )}
              <span className="text-sm text-gray-500">Total: {meta?.total || 0} devis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par ID, client, commercial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as QuoteStatus | '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="SENDED">Envoyé</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Accepté</option>
              <option value="REJECTED">Refusé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Tableau des devis */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-500">Chargement des devis...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Aucun devis trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commercial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{quote.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quote.cart.user.firstName} {quote.cart.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quote.cart.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quote.commercial ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {quote.commercial.user.firstName} {quote.commercial.user.lastName}
                          </div>
                          <div className="text-gray-500">
                            {quote.commercial.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {quote.cart.cartItems.length} article(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(calculateQuoteTotal(quote))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(quote.status)}`}>
                        {getStatusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(quote.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/orders/${quote.id}`)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>
                        {quote.fileUrl && (
                          <button
                            onClick={() => downloadQuoteFile(quote.fileUrl!, `devis-${quote.id}.pdf`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Télécharger le PDF"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => openAssignModal(quote.id, quote.commercialId)}
                          className="text-purple-600 hover:text-purple-900"
                          title={quote.commercial ? 'Modifier le commercial' : 'Assigner un commercial'}
                        >
                          {quote.commercial ? <UserCog size={18} /> : <UserPlus size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === meta.lastPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{(currentPage - 1) * meta.limit + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(currentPage * meta.limit, meta.total)}
                </span>{' '}
                sur <span className="font-medium">{meta.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Numéros de page */}
                {Array.from({ length: Math.min(5, meta.lastPage) }, (_, i) => {
                  let pageNumber;
                  if (meta.lastPage <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= meta.lastPage - 2) {
                    pageNumber = meta.lastPage - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === meta.lastPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'assignation */}
      <AssignCommercialModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        onAssign={handleAssignCommercial}
        currentCommercialId={currentCommercialId}
      />
    </div>
  );
};

export default Orders; 