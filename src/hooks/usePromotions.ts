import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductMeta } from '../types/product';
import { promotionService, type GetPromotionsParams } from '../services/promotionService';

interface UsePromotionsOptions extends GetPromotionsParams {}

export const usePromotions = (options?: UsePromotionsOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ProductMeta | null>(null);

  const { page = 1, limit = 10 } = options || {};

  // Chargement des promotions depuis l'API
  const loadPromotions = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = params?.page ?? page;
      const currentLimit = params?.limit ?? limit;

      const {
        products: fetched,
        meta: apiMeta,
      } = await promotionService.getPromotions({ page: currentPage, limit: currentLimit });

      if (apiMeta) {
        setMeta({
          currentPage: apiMeta.page,
          lastPage: apiMeta.lastPage,
          perPage: apiMeta.limit,
          total: apiMeta.total,
        });
      } else {
        const total = fetched.length;
        setMeta({ currentPage: 1, lastPage: 1, perPage: total, total });
      }

      setProducts(fetched);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des promotions');
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const clearError = useCallback(() => setError(null), []);

  const refreshPromotions = useCallback(() => {
    loadPromotions();
  }, [loadPromotions]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  return {
    products,
    loading,
    error,
    meta,
    loadPromotions,
    clearError,
    refreshPromotions,
  };
}; 