import { useState, useEffect, useCallback } from 'react';
import type { Product, CreateProductInput, UpdateProductInput, ProductMeta } from '../types/product';
import { productService, type GetProductsParams } from '../services/productService';

interface UseProductsOptions extends GetProductsParams {}

export const useProducts = (options?: UseProductsOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ProductMeta | null>(null);

  const { page = 1, limit = 10 } = options || {};

  // Chargement des produits depuis l'API
  const loadProducts = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = params?.page ?? page;
      const currentLimit = params?.limit ?? limit;

      const {
        products: fetchedProducts,
        meta: apiMeta,
      } = await productService.getProducts({ page: currentPage, limit: currentLimit });

      if (apiMeta) {
        setMeta({
          currentPage: apiMeta.page,
          lastPage: apiMeta.lastPage,
          perPage: apiMeta.limit,
          total: apiMeta.total,
        });
      } else {
        const total = fetchedProducts.length;
        setMeta({ currentPage: 1, lastPage: 1, perPage: total, total });
      }

      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits');
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const createProduct = useCallback(async (data: CreateProductInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await productService.createProduct(data);
      await loadProducts();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du produit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const updateProduct = useCallback(async (id: number, data: UpdateProductInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await productService.updateProduct(id, data);
      await loadProducts();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du produit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      await loadProducts();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du produit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts]);

  const clearError = useCallback(() => setError(null), []);

  const refreshProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    meta,
    createProduct,
    updateProduct,
    deleteProduct,
    loadProducts,
    clearError,
    refreshProducts,
  };
}; 