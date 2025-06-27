import React, { useState } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Globe, Package, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useBrands } from '../hooks/useBrands';
import type { Brand, CreateBrandInput } from '../types/brand';
import BrandModal from '../components/features/BrandModal';
import ConfirmModal from '../components/features/ConfirmModal';
import { useToast } from '../contexts/ToastContext';

const Brands: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const { showSuccess, showError } = useToast();

  // Utiliser le hook personnalisé
  const {
    brands,
    loading,
    error,
    meta,
    createBrand,
    updateBrand,
    loadBrands,
    clearError,
    refreshBrands
  } = useBrands({ page: currentPage, limit: itemsPerPage });

  // Réinitialiser la page lors du changement du nombre d'éléments par page
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    loadBrands({ page: 1, limit: newLimit });
  };

  // Filtrer les marques
  const filteredBrands = brands?.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && brand.isActive) ||
      (filterStatus === 'inactive' && !brand.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Ouvrir le modal de création
  const handleCreate = () => {
    setSelectedBrand(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (data: CreateBrandInput) => {
    let success = false;
    
    if (modalMode === 'create') {
      success = await createBrand(data);
      if (success) showSuccess('Marque créée avec succès');
    } else if (selectedBrand) {
      success = await updateBrand(selectedBrand.id, data);
      if (success) showSuccess('Marque modifiée avec succès');
    }
    
    if (success) {
      setIsModalOpen(false);
      setSelectedBrand(null);
      clearError();
    } else {
      showError(error || 'Une erreur est survenue');
    }
  };

  // Confirmer la suppression
  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteModalOpen(true);
  };

  // Supprimer la marque
  const handleDelete = async () => {
    if (!brandToDelete) return;
    
    try {
      const response = await fetch(`/api/v1/brands/${brandToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      // Fermer le modal immédiatement
      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
      
      // Recharger les marques
      await loadBrands({ page: currentPage, limit: itemsPerPage });
      
      // Message de succès (optionnel)
      console.log(`Marque "${brandToDelete.name}" supprimée avec succès`);
      showSuccess(`Marque "${brandToDelete.name}" supprimée avec succès`);
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      showError(error.message || 'Erreur lors de la suppression de la marque');
    } finally {
      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
    }
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || (meta && page > meta.lastPage)) return;
    setCurrentPage(page);
    loadBrands({ page, limit: itemsPerPage });
  };

  // Générer les numéros de page à afficher
  const generatePageNumbers = () => {
    if (!meta || meta.lastPage <= 1) return [];
    
    const pages = [];
    const totalPages = meta.lastPage;
    const current = currentPage;
    
    pages.push(1);
    
    const startPage = Math.max(2, current - 2);
    const endPage = Math.min(totalPages - 1, current + 2);
    
    if (startPage > 2) {
      pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Formater la date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag size={32} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Marques</h1>
            {meta && (
              <p className="text-sm text-gray-500 mt-1">
                {meta.total} marque{meta.total > 1 ? 's' : ''} au total
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshBrands}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Actualiser
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Nouvelle marque
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, description ou pays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Statut:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Toutes</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
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
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des marques */}
      <div className="bg-white rounded-lg shadow">
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
              onClick={refreshBrands}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : !brands || brands.length === 0 ? (
          <div className="p-8 text-center">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucune marque</p>
            <p className="text-gray-500 text-sm">
              Il n'y a pas encore de marques enregistrées dans le système.
            </p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-8 text-center">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucun résultat</p>
            <p className="text-gray-500">
              Aucune marque ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredBrands.map((brand) => (
                <div key={brand.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Logo et nom */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {brand.logo ? (
                          <img 
                            src={brand.logo} 
                            alt={brand.name}
                            className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Tag size={24} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{brand.name}</h3>
                          {brand.country && (
                            <p className="text-sm text-gray-500">{brand.country}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {brand.isActive ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <XCircle size={12} />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {brand.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {brand.description}
                      </p>
                    )}

                    {/* Informations */}
                    <div className="space-y-2 mb-4">
                      {brand.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Globe size={14} />
                          <a 
                            href={brand.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 truncate"
                          >
                            {brand.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Package size={14} />
                        <span>{brand.productsCount || 0} produits</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-400">
                        Créée le {formatDate(brand.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(brand)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.lastPage > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} sur {meta.lastPage}
                  </span>
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
                      Affichage de{' '}
                      <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                      {' '}à{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, meta.total)}
                      </span>
                      {' '}sur{' '}
                      <span className="font-medium">{meta.total}</span>
                      {' '}résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      {generatePageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === meta.lastPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal marque */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        brand={selectedBrand}
        mode={modalMode}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer la marque"
        message={`Êtes-vous sûr de vouloir supprimer la marque ${brandToDelete?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default Brands; 