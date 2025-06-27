import { useState, useEffect, useCallback } from 'react';
import type { Brand, CreateBrandInput, UpdateBrandInput, BrandMeta } from '../types/brand';
import { brandService, type GetBrandsParams } from '../services/brandService';

interface UseBrandsOptions extends GetBrandsParams {}

export const useBrands = (options?: UseBrandsOptions) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<BrandMeta | null>(null);

  const { page = 1, limit = 10 } = options || {};

  // Chargement des marques depuis l'API
  const loadBrands = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = params?.page ?? page;
      const currentLimit = params?.limit ?? limit;

      const { brands: fetchedBrands, meta: apiMeta } = await brandService.getBrands({ page: currentPage, limit: currentLimit });

      // Si l'API ne renvoie pas de pagination, on la calcule côté client
      if (apiMeta) {
        setMeta({
          currentPage: apiMeta.page,
          lastPage: apiMeta.lastPage,
          perPage: apiMeta.limit,
          total: apiMeta.total,
        });
        setBrands(fetchedBrands);
      } else {
        const total = fetchedBrands.length;
        setMeta({
          currentPage: 1,
          lastPage: 1,
          perPage: total,
          total,
        });
        setBrands(fetchedBrands);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des marques');
      setBrands([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Créer une nouvelle marque
  const createBrand = useCallback(async (data: CreateBrandInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const newBrand = await brandService.createBrand(data);
      // On insère la nouvelle marque en tête de liste (optimiste)
      setBrands((prev) => [newBrand, ...prev]);
      // Mise à jour du compteur total si pagination
      setMeta((prev) => prev ? { ...prev, total: prev.total + 1 } : prev);
      return true;
    } catch (err) {
      setError('Erreur lors de la création de la marque');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une marque
  const updateBrand = useCallback(async (id: string, data: UpdateBrandInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await brandService.updateBrand(id, data);
      await loadBrands();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de la marque');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadBrands]);

  // Supprimer une marque
  const deleteBrand = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await brandService.deleteBrand(id);
      await loadBrands();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la marque');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadBrands]);

  // Effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Actualiser les marques
  const refreshBrands = useCallback(() => {
    loadBrands();
  }, [loadBrands]);

  // Charger les marques au montage
  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  return {
    brands,
    loading,
    error,
    meta,
    createBrand,
    updateBrand,
    deleteBrand,
    loadBrands,
    clearError,
    refreshBrands
  };
}; 