import React, { useState } from 'react';
import { Percent, Plus, Search, Edit2, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCcw, Eye } from 'lucide-react';
import type { Product } from '../types/product';
import type { CreatePromotionInput } from '../types/promotion';
import PromotionModal from '../components/features/PromotionModal';
import ConfirmModal from '../components/features/ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import { usePromotions } from '../hooks/usePromotions';

// Les données seront désormais chargées depuis l'API via usePromotions

const Promotions: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const {
    products: promotions,
    loading,
    error,
    meta,
    refreshPromotions,
    loadPromotions,
  } = usePromotions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPromotion, setSelectedPromotion] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Product | null>(null);

  // Évite les variables inutilisées grâce à un rendu conditionnel simple
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-gray-600">
        Chargement des promotions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-red-600">
        {error}
      </div>
    );
  }

  // Filtrage
  const filteredPromotions = promotions.filter((prod: Product) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && prod.isActive) ||
      (filterStatus === 'inactive' && !prod.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination (basée sur la meta de l'API si dispo)
  const totalPages = meta ? meta.lastPage : Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions;

  // Formatage
  const formatDiscount = (prod: Product) => {
    if (!prod.compareAtPrice) return '-';
    const discount = Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
    return `-${discount}%`;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Handlers
  const handleCreate = () => {
    setSelectedPromotion(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (promo: Product) => {
    setSelectedPromotion(promo);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = (_data: CreatePromotionInput) => {
    // Pour cette démo, on ne gère pas vraiment les promotions
    // On affiche juste un message de succès
    if (modalMode === 'create') {
      showSuccess('Promotion créée avec succès');
    } else {
      showSuccess(`Promotion modifiée avec succès${selectedPromotion ? ` pour ${selectedPromotion.name}` : ''}`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (promo: Product) => {
    setPromotionToDelete(promo);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!promotionToDelete) return;
    
    try {
      // Recharger la liste depuis l'API
      refreshPromotions();
      showSuccess('Promotion supprimée avec succès');
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression de la promotion');
    } finally {
      setIsDeleteModalOpen(false);
      setPromotionToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadPromotions({ page, limit: itemsPerPage });
    }
  };

  // Actualiser (réinitialise la recherche & filtres)
  const handleRefresh = () => {
    refreshPromotions();
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Percent size={32} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Promotions</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPromotions.length} promotion{filteredPromotions.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <RefreshCcw size={18} />
            Actualiser
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Nouvelle promotion
          </button>
        </div>
      </div>

      {/* Recherche & filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Statut:</label>
              <select
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tous</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Afficher:</label>
              <select
                value={itemsPerPage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newLimit = Number(e.target.value);
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                  loadPromotions({ page: 1, limit: newLimit });
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes */}
      <div>
        {paginatedPromotions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <Percent size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucune promotion</p>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Aucune promotion ne correspond à vos critères.'
                : "Il n'y a pas encore de promotions enregistrées."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedPromotions.map((promo: Product) => (
                <div key={promo.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
                  {/* Image */}
                  {promo.imageUrl && (
                    <img src={promo.imageUrl} alt={promo.name} className="h-40 w-full object-cover rounded-t-lg" loading="lazy" />
                  )}

                  {/* Contenu */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{promo.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{promo.description}</p>

                    <div className="text-sm text-gray-700 space-y-1 mt-auto">
                      <p><span className="font-medium">Catégorie :</span> {promo.categoryName || '-'}</p>
                      <p><span className="font-medium">Marque :</span> {promo.brandName || '-'}</p>
                      <p><span className="font-medium">Prix HT :</span> {promo.priceHt?.toFixed(2)} €</p>
                      <p><span className="font-medium">Prix TTC :</span> {promo.priceTtc?.toFixed(2)} €</p>
                      <p><span className="font-medium">Stock :</span> {promo.quantity}</p>
                      <p><span className="font-medium">Remise :</span> {formatDiscount(promo)}</p>
                      <p><span className="font-medium">Fin promo :</span> {formatDate(promo.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Footer – actions & statut */}
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    {promo.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}

                    <div className="flex gap-3 text-gray-500">
                      <button onClick={() => console.log('Voir', promo)} className="hover:text-blue-600">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEdit(promo)} className="hover:text-emerald-600">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteClick(promo)} className="hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border text-gray-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Préc.
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border text-gray-700 disabled:opacity-50 flex items-center gap-1"
                >
                  Suiv. <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        promotion={null}
        mode={modalMode}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la promotion"
        message="Êtes-vous sûr de vouloir supprimer cette promotion ? Cette action est irréversible."
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default Promotions; 