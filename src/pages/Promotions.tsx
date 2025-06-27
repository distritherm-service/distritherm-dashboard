import React, { useState } from 'react';
import { Percent, Plus, Search, Edit2, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCcw, Eye } from 'lucide-react';
import type { Product } from '../types/product';
import type { CreatePromotionInput } from '../types/promotion';
import PromotionModal from '../components/features/PromotionModal';
import ConfirmModal from '../components/features/ConfirmModal';
import { useToast } from '../contexts/ToastContext';

// Données fictives de produits (extraites de la page Produits)
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Climatiseur Daikin FTXM25R',
    description: 'Climatiseur mural inverter 2.5kW, classe énergétique A+++',
    sku: 'DAI-FTXM25R',
    price: 899.99,
    compareAtPrice: 1099.99,
    cost: 650,
    quantity: 15,
    imageUrl: '/knauf-logo.png',
    brandId: 1,
    brandName: 'Daikin',
    categoryId: 1,
    categoryName: 'Climatisation',
    isActive: true,
    isFeatured: true,
    tags: ['inverter', 'mural', 'silencieux'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Pompe à chaleur Mitsubishi Ecodan',
    description: 'Pompe à chaleur air-eau haute performance',
    sku: 'MIT-ECODAN-8',
    price: 4599.99,
    compareAtPrice: 5299.99,
    cost: 3200,
    quantity: 5,
    imageUrl: '/knauf-logo.png',
    brandId: 2,
    brandName: 'Mitsubishi',
    categoryId: 2,
    categoryName: 'Chauffage',
    isActive: true,
    isFeatured: true,
    tags: ['pompe-chaleur', 'air-eau'],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 3,
    name: 'Climatiseur LG Dual Inverter',
    description: 'Climatiseur split avec technologie Dual Inverter, 3.5kW',
    sku: 'LG-DUAL35',
    price: 749.99,
    // Pas de prix barré -> pas de promo
    quantity: 8,
    imageUrl: '/knauf-logo.png',
    brandId: 3,
    brandName: 'LG',
    categoryId: 1,
    categoryName: 'Climatisation',
    isActive: true,
    isFeatured: false,
    tags: ['dual-inverter', 'split'],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
];

// Produits en promotion = ceux qui ont un prix barré supérieur
const promotionalProducts: Product[] = mockProducts.filter(
  (p) => p.compareAtPrice && p.compareAtPrice > p.price,
);

const Promotions: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [promotions, setPromotions] = useState<Product[]>(promotionalProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPromotion, setSelectedPromotion] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Product | null>(null);

  // Filtrage
  const filteredPromotions = promotions.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && prod.isActive) ||
      (filterStatus === 'inactive' && !prod.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      // Simuler la suppression (remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fermer le modal immédiatement
      setIsDeleteModalOpen(false);
      setPromotionToDelete(null);
      
      // Mettre à jour la liste
      setPromotions(prev => prev.filter(p => p.id !== promotionToDelete.id));
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
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Actualiser (réinitialise la recherche & filtres)
  const handleRefresh = () => {
    setPromotions([...promotionalProducts]);
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Statut:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
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
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
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

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedPromotions.length === 0 ? (
          <div className="p-8 text-center">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promotion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPromotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{promo.name}</div>
                        {promo.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {promo.description.length > 80
                              ? promo.description.substring(0, 77) + '...'
                              : promo.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDiscount(promo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(promo.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {promo.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <CheckCircle size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-sm font-medium">
                            <XCircle size={14} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                        <button
                          onClick={() => console.log('Voir', promo)}
                          className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(promo)}
                          className="text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(promo)}
                          className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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