import React, { useState } from 'react';
import { Layers, Plus, Search, Edit2, Trash2, Image, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Loader2, X, Info, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import type { Category, CreateCategoryInput } from '../types/category';
import CategoryModal from '../components/features/CategoryModal';
import ConfirmModal from '../components/features/ConfirmModal';
import { createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { useCategories } from '../hooks/useCategories';
import { debugAuth } from '../utils/debugAuth';
import { useToast } from '../contexts/ToastContext';

const Categories: React.FC = () => {
  const { categories: allCategories, loading, error, refetch, getCategoryLevel } = useCategories();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | number>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Synchroniser les catégories du hook avec l'état local
  React.useEffect(() => {
    setCategories(allCategories);
  }, [allCategories]);

  // Fonction pour toggle l'expansion d'une catégorie
  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Fonction pour ouvrir toutes les catégories
  const expandAll = () => {
    const categoriesWithChildren = categories.filter(cat => categoryHasChildren(cat.id));
    setExpandedCategories(new Set(categoriesWithChildren.map(cat => cat.id)));
  };

  // Fonction pour fermer toutes les catégories
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Filtrer les catégories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Pour le moment, on considère toutes les catégories comme actives car l'API ne retourne pas de statut
    const matchesStatus = filterStatus === 'all' || filterStatus === 'active';
    
    const matchesLevel = filterLevel === 'all' || 
      (typeof filterLevel === 'number' && category.level === filterLevel);
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // Organiser les catégories en arbre
  const buildCategoryTree = () => {
    const rootCategories = filteredCategories.filter(cat => !cat.parentCategoryId);
    
    const getCategoryChildren = (parentId: number): Category[] => {
      return filteredCategories
        .filter(cat => cat.parentCategoryId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    return { rootCategories, getCategoryChildren };
  };

  const { rootCategories, getCategoryChildren } = buildCategoryTree();

  // Pagination pour les catégories racines uniquement
  const totalPages = Math.ceil(rootCategories.length / itemsPerPage);
  const paginatedRootCategories = rootCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Ouvrir le modal de création
  const handleCreate = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (data: CreateCategoryInput) => {
    try {
      if (modalMode === 'create') {
        await createCategory(data);
        showSuccess('Catégorie créée avec succès');
      } else if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
        showSuccess('Catégorie modifiée avec succès');
      }
      setIsModalOpen(false);
      // Recharger les catégories
      refetch();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      showError('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  // Confirmer la suppression
  const handleDeleteClick = (category: Category) => {
    // Réinitialiser les états d'erreur et de succès
    setDeleteError(null);
    setDeleteSuccess(null);
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // Vérifier si une catégorie a des enfants
  const categoryHasChildren = (categoryId: number): boolean => {
    return categories.some(cat => cat.parentCategoryId === categoryId);
  };

  // Obtenir les informations d'avertissement pour la suppression
  const getDeleteWarnings = (category: Category | null): string[] => {
    if (!category) return [];
    
    const warnings: string[] = [];
    
    // Fonction récursive pour compter toutes les sous-catégories
    const countAllDescendants = (categoryId: number): number => {
      const directChildren = categories.filter(cat => cat.parentCategoryId === categoryId);
      let count = directChildren.length;
      
      directChildren.forEach(child => {
        count += countAllDescendants(child.id);
      });
      
      return count;
    };
    
    // Fonction pour obtenir tous les descendants
    const getAllDescendantNames = (categoryId: number, level: number = 0): string[] => {
      const names: string[] = [];
      const directChildren = categories.filter(cat => cat.parentCategoryId === categoryId);
      
      directChildren.forEach(child => {
        names.push('  '.repeat(level) + '• ' + child.name);
        names.push(...getAllDescendantNames(child.id, level + 1));
      });
      
      return names;
    };
    
    // Vérifier si la catégorie a des sous-catégories
    const totalDescendants = countAllDescendants(category.id);
    if (totalDescendants > 0) {
      warnings.push(`⚠️ ATTENTION : Cette catégorie contient ${totalDescendants} sous-catégorie${totalDescendants > 1 ? 's' : ''}`);
      warnings.push('Toutes les sous-catégories seront supprimées en cascade');
      
      // Afficher toutes les sous-catégories si moins de 10
      if (totalDescendants <= 10) {
        const descendantNames = getAllDescendantNames(category.id);
        warnings.push('Vous devez d\'abord supprimer :');
        warnings.push(...descendantNames);
      } else {
        warnings.push(`Vous devez d\'abord supprimer toutes les ${totalDescendants} sous-catégories`);
      }
      
      // On continue sans retour anticipé : la suppression sera autorisée mais on avertit l’utilisateur
    }
    
    // Vérifier le niveau de la catégorie
    if (category.level === 1 || !category.haveParent) {
      warnings.push('Il s\'agit d\'une catégorie principale');
    }
    
    warnings.push('Cette action est irréversible');
    
    return warnings;
  };

  // Supprimer la catégorie
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    // Debug de l'authentification
    console.log('=== Tentative de suppression ===');
    console.log('Catégorie à supprimer:', categoryToDelete);
    debugAuth();
    
    setIsDeleting(true);
    setDeleteError(null); // Réinitialiser les erreurs précédentes
    
    try {
      const result = await deleteCategory(categoryToDelete.id);
      
      // Succès - Afficher le message
      const successMessage = result.message || `Catégorie "${categoryToDelete.name}" supprimée avec succès`;
      showSuccess(successMessage);
      
      // Fermer le modal immédiatement après le succès
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      
      // Recharger les catégories
      await refetch();
      
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      
      // Afficher l'erreur dans l'interface (pas une alerte)
      const errorMessage = err.message || 'Erreur lors de la suppression de la catégorie';
      
      // Si c'est une erreur 401, elle sera gérée par le service (redirection)
      if (!errorMessage.includes('Session expirée')) {
        showError(errorMessage);
      }
    } finally {
      // S'assurer que le loading est toujours désactivé et modal fermé
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Générer les numéros de page
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Composant pour afficher une catégorie et ses enfants
  const CategoryRow: React.FC<{ category: Category; level: number }> = ({ category, level }) => {
    const children = getCategoryChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <>
        <div 
          className={`group border-b border-gray-200 hover:bg-gray-50 transition-colors category-hover-effect ${
            level > 0 ? 'bg-gray-50/50' : ''
          }`}
          style={{ paddingLeft: `${level * 2}rem` }}
        >
          <div className="flex items-center py-4 px-6">
            {/* Bouton d'expansion */}
            <div className="w-8 flex-shrink-0">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                  title={isExpanded ? 'Réduire' : 'Développer'}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </button>
              )}
            </div>

            {/* Image et nom */}
            <div className="flex items-center flex-1 min-w-0">
              {category.imageUrl ? (
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {hasChildren ? (
                    isExpanded ? <FolderOpen size={20} className="text-gray-400" /> : <Folder size={20} className="text-gray-400" />
                  ) : (
                    <Image size={20} className="text-gray-400" />
                  )}
                </div>
              )}
              <div className="ml-4 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {category.name}
                  </div>
                  {hasChildren && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 flex-shrink-0">
                      {children.length} enfant{children.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {category.alias || category.name.toLowerCase().replace(/\s+/g, '-')}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="hidden md:block flex-1 px-4">
              <div className="text-sm text-gray-600 truncate max-w-xs">
                {category.description || '-'}
              </div>
            </div>

            {/* Niveau et statut */}
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <span className="text-sm text-gray-600">
                {getCategoryLevel(category.level || 0)}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={12} />
                Active
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleEdit(category)}
                className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDeleteClick(category)}
                className={`p-2 rounded transition-colors cursor-pointer ${hasChildren ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`}
                title={hasChildren ? 'Supprimer la catégorie et toutes ses sous-catégories' : 'Supprimer'}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Afficher les enfants si la catégorie est étendue */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-6 category-expand">
            {children.map(child => (
              <CategoryRow key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers size={32} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Catégories</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Nouvelle catégorie
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              title="Développer tout"
            >
              Tout ouvrir
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              title="Réduire tout"
            >
              Tout fermer
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Niveau:</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tous les niveaux</option>
              {[...new Set(categories.map(cat => cat.level || 0))].sort((a, b) => a - b).map(level => {
                const count = categories.filter(cat => (cat.level || 0) === level).length;
                return (
                  <option key={level} value={level}>
                    {getCategoryLevel(level)} ({count})
                  </option>
                );
              })}
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

      {/* État de chargement */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Chargement des catégories...</span>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
            <button
              onClick={refetch}
              className="text-red-700 hover:text-red-900 font-medium text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {deleteSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="mr-2" size={20} />
              {deleteSuccess}
            </div>
            <button
              onClick={() => setDeleteSuccess(null)}
              className="text-green-700 hover:text-green-900"
              title="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Message d'erreur de suppression */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span className="font-medium">Erreur de suppression</span>
              </div>
              <p className="mt-1 text-sm">{deleteError}</p>
              {deleteError.includes('sous-catégories') && (
                <p className="mt-2 text-sm">
                  💡 Astuce : Commencez par supprimer les catégories qui n'ont pas de sous-catégories.
                </p>
              )}
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-700 hover:text-red-900 ml-4"
              title="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Liste des catégories en arbre */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <Layers size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-700 font-medium mb-2">Aucune catégorie</p>
              <p className="text-gray-500">
                {searchTerm || filterLevel !== 'all'
                  ? 'Aucune catégorie ne correspond à vos critères de recherche.'
                  : 'Il n\'y a pas encore de catégories enregistrées.'}
              </p>
            </div>
          ) : (
            <>
              {/* En-tête de la liste */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Structure des catégories
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Info size={14} />
                    <span>Cliquez sur les flèches pour voir les sous-catégories</span>
                  </div>
                </div>
              </div>

              {/* Liste des catégories */}
              <div>
                {paginatedRootCategories.map(category => (
                  <CategoryRow key={category.id} category={category} level={0} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
                          {Math.min(currentPage * itemsPerPage, rootCategories.length)}
                        </span>
                        {' '}sur{' '}
                        <span className="font-medium">{rootCategories.length}</span>
                        {' '}catégories principales
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
                          disabled={currentPage === totalPages}
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
      )}

      {/* Modal catégorie */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        category={selectedCategory}
        mode={modalMode}
        categories={categories} // Passer toutes les catégories pour permettre la hiérarchie complète
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
        onConfirm={handleDelete}
        title={categoryToDelete && categoryHasChildren(categoryToDelete.id) ? 'Supprimer la catégorie et ses sous-catégories' : 'Supprimer la catégorie'}
        message={categoryToDelete ? (categoryHasChildren(categoryToDelete.id)
          ? `La catégorie "${categoryToDelete.name}" et toutes ses sous-catégories seront définitivement supprimées. Cette action est irréversible. Voulez-vous continuer ?`
          : `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete.name}" ?`)
          : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        type={categoryToDelete && categoryHasChildren(categoryToDelete.id) ? 'warning' : 'danger'}
        additionalInfo={getDeleteWarnings(categoryToDelete)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Categories; 