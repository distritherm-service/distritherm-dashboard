import React, { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Image, CheckCircle, XCircle, ChevronLeft, ChevronRight, Star, TrendingUp, RefreshCcw, Eye } from 'lucide-react';
import type { Product, CreateProductInput } from '../types/product';
import ProductModal from '../components/features/ProductModal';
import ConfirmModal from '../components/features/ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import { useProducts } from '../hooks/useProducts';
import { useBrands } from '../hooks/useBrands';
import { useCategories } from '../hooks/useCategories';

const Products: React.FC = () => {
  const { showSuccess, showError } = useToast();
  // Hooks API
  const {
    products,
    meta,
    createProduct: createProductApi,
    updateProduct: updateProductApi,
    deleteProduct: deleteProductApi,
    loadProducts,
  } = useProducts();

  // Marques & catégories
  const { brands } = useBrands();
  const { categories } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'instock' | 'outofstock'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'notfeatured'>('all');
  const [filterBrand, setFilterBrand] = useState<string | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && product.isActive) ||
      (filterStatus === 'inactive' && !product.isActive);
    
    const matchesStock = filterStock === 'all' ||
      (filterStock === 'instock' && product.quantity > 0) ||
      (filterStock === 'outofstock' && product.quantity === 0);
    
    const matchesFeatured = filterFeatured === 'all' ||
      (filterFeatured === 'featured' && product.isFeatured) ||
      (filterFeatured === 'notfeatured' && !product.isFeatured);
    
    const matchesBrand = filterBrand === 'all' || product.brandId === Number(filterBrand);
    const matchesCategory = filterCategory === 'all' || product.categoryId === Number(filterCategory);
    
    return matchesSearch && matchesStatus && matchesStock && matchesFeatured && matchesBrand && matchesCategory;
  });

  // Pagination
  const totalItems = meta?.total ?? filteredProducts.length;
  const totalPages = meta ? meta.lastPage : Math.ceil(filteredProducts.length / itemsPerPage);
  // Si l'API gère la pagination (meta présent), les produits reçus correspondent déjà à la page courante
  const paginatedProducts = meta ? filteredProducts : filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Ouvrir le modal de création
  const handleCreate = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (data: CreateProductInput) => {
    try {
      let success = false;
      if (modalMode === 'create') {
        success = await createProductApi(data);
        if (success) showSuccess('Produit créé avec succès');
      } else if (selectedProduct) {
        success = await updateProductApi(selectedProduct.id, data);
        if (success) showSuccess('Produit modifié avec succès');
      }
      if (success) {
        setIsModalOpen(false);
        loadProducts({ page: currentPage, limit: itemsPerPage });
      }
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l’enregistrement du produit');
    }
  };

  // Confirmer la suppression
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Supprimer le produit
  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProductApi(productToDelete.id);
      showSuccess(`Produit "${productToDelete.name}" supprimé avec succès`);
      loadProducts({ page: currentPage, limit: itemsPerPage });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      showError(error.message || 'Erreur lors de la suppression du produit');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadProducts({ page, limit: itemsPerPage });
    }
  };

  // Actualiser (réinitialise les filtres et recherche)
  const handleRefresh = () => {
    loadProducts();
    setSearchTerm('');
    setFilterStatus('all');
    setFilterStock('all');
    setFilterFeatured('all');
    setFilterBrand('all');
    setFilterCategory('all');
    setCurrentPage(1);
  };

  // Calculer le pourcentage de réduction
  const getDiscountPercentage = (price: number, compareAtPrice?: number) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

  // Calculer la marge
  const getMargin = (price: number, cost?: number) => {
    if (!cost || cost >= price) return 0;
    return Math.round(((price - cost) / price) * 100);
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={32} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Produits</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalItems} produit{totalItems > 1 ? 's' : ''} au total
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
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, SKU, description ou tags..."
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
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Stock:</label>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tous</option>
                <option value="instock">En stock</option>
                <option value="outofstock">Rupture</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Vedette:</label>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tous</option>
                <option value="featured">Vedettes</option>
                <option value="notfeatured">Non vedettes</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Marque:</label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Toutes</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Catégorie:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Toutes</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Afficher:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                  loadProducts({ page: 1, limit: Number(e.target.value) });
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

      {/* Tableau des produits */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucun produit</p>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterStock !== 'all' || filterFeatured !== 'all' || filterBrand !== 'all' || filterCategory !== 'all'
                ? 'Aucun produit ne correspond à vos critères de recherche.'
                : 'Il n\'y a pas encore de produits enregistrés.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie / Marque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
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
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Image size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {product.name}
                              {product.isFeatured && (
                                <Star size={14} className="text-yellow-500 fill-current" />
                              )}
                            </div>
                            {product.tags && product.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {product.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {product.tags.length > 2 && (
                                  <span className="text-xs text-gray-500">+{product.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{product.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900">{product.categoryName}</div>
                          <div className="text-gray-500">{product.brandName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{formatPrice(product.price)}</div>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                              <span className="text-xs text-red-600 font-medium">
                                -{getDiscountPercentage(product.price, product.compareAtPrice)}%
                              </span>
                            </div>
                          )}
                          {product.cost && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <TrendingUp size={12} />
                              Marge: {getMargin(product.price, product.cost)}%
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          product.quantity > 10 ? 'text-green-600' : 
                          product.quantity > 0 ? 'text-orange-600' : 
                          'text-red-600'
                        }`}>
                          {product.quantity > 0 ? `${product.quantity} unités` : 'Rupture'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.isActive ? (
                            <>
                              <CheckCircle size={12} />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              Inactif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                        <button
                          onClick={() => console.log('Voir', product)}
                          className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
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
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                      </span>
                      {' '}sur{' '}
                      <span className="font-medium">{totalItems}</span>
                      {' '}résultats
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
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNumber === currentPage
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

      {/* Modal produit */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        product={selectedProduct}
        mode={modalMode}
        brands={brands}
        categories={categories}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer le produit "${productToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default Products; 