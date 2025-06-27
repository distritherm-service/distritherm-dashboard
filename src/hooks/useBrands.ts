import { useState, useEffect, useCallback } from 'react';
import type { Brand, CreateBrandInput, UpdateBrandInput, BrandMeta } from '../types/brand';

interface UseBrandsOptions {
  page?: number;
  limit?: number;
}

// Données simulées pour le moment
const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'Daikin',
    logo: '/knauf-logo.png',
    description: 'Leader mondial dans les solutions de climatisation et de chauffage',
    website: 'https://www.daikin.com',
    country: 'Japon',
    isActive: true,
    productsCount: 45,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    name: 'Mitsubishi Electric',
    logo: '/knauf-logo.png',
    description: 'Technologies avancées pour le confort thermique',
    website: 'https://www.mitsubishielectric.com',
    country: 'Japon',
    isActive: true,
    productsCount: 38,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '3',
    name: 'Atlantic',
    logo: '/knauf-logo.png',
    description: 'Spécialiste français du confort thermique',
    website: 'https://www.atlantic.fr',
    country: 'France',
    isActive: true,
    productsCount: 52,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '4',
    name: 'Panasonic',
    logo: '/knauf-logo.png',
    description: 'Innovation et qualité japonaise',
    website: 'https://www.panasonic.com',
    country: 'Japon',
    isActive: true,
    productsCount: 29,
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-12-15')
  },
  {
    id: '5',
    name: 'LG',
    logo: '/knauf-logo.png',
    description: 'Solutions de climatisation innovantes',
    website: 'https://www.lg.com',
    country: 'Corée du Sud',
    isActive: true,
    productsCount: 33,
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2023-12-20')
  }
];

export const useBrands = (options?: UseBrandsOptions) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<BrandMeta | null>(null);

  const { page = 1, limit = 10 } = options || {};

  // Simuler le chargement des marques
  const loadBrands = useCallback(async (options?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentPage = options?.page || page;
      const currentLimit = options?.limit || limit;
      
      // Pagination simulée
      const start = (currentPage - 1) * currentLimit;
      const end = start + currentLimit;
      const paginatedBrands = mockBrands.slice(start, end);

      setBrands(paginatedBrands);
      setMeta({
        currentPage,
        lastPage: Math.ceil(mockBrands.length / currentLimit),
        perPage: currentLimit,
        total: mockBrands.length
      });
    } catch (err) {
      setError('Erreur lors du chargement des marques');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Créer une nouvelle marque
  const createBrand = useCallback(async (data: CreateBrandInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newBrand: Brand = {
        id: Date.now().toString(),
        name: data.name,
        logo: data.logo,
        description: data.description,
        website: data.website,
        country: data.country,
        isActive: data.isActive ?? true,
        productsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockBrands.unshift(newBrand);
      await loadBrands();
      return true;
    } catch (err) {
      setError('Erreur lors de la création de la marque');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadBrands]);

  // Mettre à jour une marque
  const updateBrand = useCallback(async (id: string, data: UpdateBrandInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = mockBrands.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBrands[index] = {
          ...mockBrands[index],
          ...data,
          updatedAt: new Date()
        };
        await loadBrands();
        return true;
      }
      throw new Error('Marque non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la marque');
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
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = mockBrands.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBrands.splice(index, 1);
        await loadBrands();
        return true;
      }
      throw new Error('Marque non trouvée');
    } catch (err) {
      setError('Erreur lors de la suppression de la marque');
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