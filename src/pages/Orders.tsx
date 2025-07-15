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
  UserPlus
} from 'lucide-react';
import { useQuotes } from '../hooks/useQuotes';
import { useToast } from '../contexts/ToastContext';
import AssignCommercialModal from '../components/features/AssignCommercialModal';
import type { QuoteStatus } from '../types/quote';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | ''>('');
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  
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
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: QuoteStatus) => {
    switch (status) {
      case 'SENDED':
        return 'Envoyé';
      case 'PENDING':
        return 'En attente';
      case 'ACCEPTED':
        return 'Accepté';
      case 'REJECTED':
        return 'Refusé';
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

  const openAssignModal = (quoteId: number) => {
    setSelectedQuoteId(quoteId);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  const handleAssignCommercial = async (commercialId: number) => {
    if (!selectedQuoteId) return;
    const success = await updateQuote(selectedQuoteId, { commercialId });
    if (success) {
      showSuccess('Commercial assigné avec succès');
    } else {
      showError('Erreur lors de l\'assignation du commercial');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={32} className="text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Demandes de devis reçus</h1>
        </div>
        <div className="text-sm text-gray-500">
          Total: {meta?.total || 0} devis
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
                        {!quote.commercial && (
                          <button
                            onClick={() => openAssignModal(quote.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Assigner un commercial"
                          >
                            <UserPlus size={18} />
                          </button>
                        )}
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
      />
    </div>
  );
};

export default Orders; 