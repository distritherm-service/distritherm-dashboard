import React, { useState } from 'react';
import { Star, Search, AlertCircle, ChevronLeft, ChevronRight, RefreshCcw, Edit2, Trash2 } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';
import type { Review } from '../types/review';
import ReviewModal from '../components/features/ReviewModal';
import ConfirmModal from '../components/features/ConfirmModal';
import { useToast } from '../contexts/ToastContext';

const Reviews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    reviews,
    loading,
    error,
    meta,
    loadReviews,
    clearError,
    refreshReviews,
    updateReview
  } = useReviews({ page: currentPage, limit: itemsPerPage });

  const { showSuccess, showError } = useToast();

  // Gestion des modals d'édition et de suppression
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    loadReviews({ page: 1, limit });
  };

  const handlePageChange = (page: number) => {
    if (!meta) return;
    if (page < 1 || page > meta.lastPage) return;
    setCurrentPage(page);
    loadReviews({ page, limit: itemsPerPage });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredReviews = reviews.filter((rev) => {
    const term = searchTerm.toLowerCase();
    return (
      rev.customerName.toLowerCase().includes(term) ||
      rev.orderNumber.toLowerCase().includes(term) ||
      rev.comment.toLowerCase().includes(term)
    );
  });

  const handleEdit = (rev: Review) => {
    setSelectedReview(rev);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: { rating: number; comment: string }) => {
    if (!selectedReview) return;
    
    const success = await updateReview(selectedReview.id, data);
    if (success) {
      setIsModalOpen(false);
      setSelectedReview(null);
      showSuccess('Avis modifié avec succès');
    } else {
      showError('Erreur lors de la modification de l\'avis');
    }
  };

  const handleDeleteClick = (rev: Review) => {
    setReviewToDelete(rev);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    
    try {
      const response = await fetch(`/api/v1/reviews/${reviewToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      // Fermer le modal et recharger
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
      await loadReviews({ page: currentPage, limit: itemsPerPage });
      showSuccess('Avis supprimé avec succès');
      
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la suppression de l\'avis');
    } finally {
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const generatePageNumbers = () => {
    if (!meta || meta.lastPage <= 1) return [];
    const pages: (number | string)[] = [];
    const { lastPage } = meta;
    const current = currentPage;

    pages.push(1);
    const start = Math.max(2, current - 2);
    const end = Math.min(lastPage - 1, current + 2);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < lastPage - 1) pages.push('...');
    if (lastPage > 1) pages.push(lastPage);
    return pages;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            size={16}
            className={
              idx < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star size={32} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Avis des clients</h1>
            {meta && (
              <p className="text-sm text-gray-500 mt-1">
                {meta.total} avis au total
              </p>
            )}
          </div>
        </div>
        <button
          onClick={refreshReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <RefreshCcw size={18} />
          Actualiser
        </button>
      </div>

      {/* Barre de recherche et paramètres */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, commande ou commentaire..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Afficher:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Tableau des avis */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Erreur de chargement</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucun avis</p>
            <p className="text-gray-500 text-sm">Il n'y a aucun avis correspondant à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6 space-y-4">
                  {/* En-tête étoiles + actions */}
                  <div className="flex items-start justify-between">
                    {renderStars(rev.rating)}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(rev)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(rev)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <p><span className="font-medium text-gray-700">Commande :</span> {rev.orderNumber}</p>
                    <p><span className="font-medium text-gray-700">Client :</span> {rev.customerName}</p>
                    <p className="line-clamp-2 text-gray-700">{rev.comment}</p>
                  </div>

                  {/* Pied */}
                  <div className="pt-2 border-t text-xs text-gray-400">
                    {formatDate(rev.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} sur {meta.lastPage}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === meta.lastPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                {' '}à{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, meta.total)}</span>
                {' '}sur{' '}
                <span className="font-medium">{meta.total}</span>
                {' '}résultats
              </p>
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              {generatePageNumbers().map((page, idx) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.lastPage}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      <ReviewModal
        isOpen={isModalOpen}
        review={selectedReview}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'avis"
        message={`Êtes-vous sûr de vouloir supprimer l'avis du client ${reviewToDelete?.customerName} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default Reviews;