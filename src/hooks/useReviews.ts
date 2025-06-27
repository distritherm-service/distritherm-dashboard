import { useState, useEffect, useCallback } from 'react';
import type { Review, ReviewMeta } from '../types/review';

interface UseReviewsOptions {
  page?: number;
  limit?: number;
}

// Données simulées (mock) pour les avis
const mockReviews: Review[] = [
  {
    id: '1',
    orderNumber: 'CMD-2024001',
    customerName: 'Jean Dupont',
    rating: 5,
    comment: 'Excellent service et livraison rapide !',
    createdAt: new Date('2024-03-02')
  },
  {
    id: '2',
    orderNumber: 'CMD-2024002',
    customerName: 'Marie Curie',
    rating: 4,
    comment: "Produit conforme à la description, je recommande.",
    createdAt: new Date('2024-03-05')
  },
  {
    id: '3',
    orderNumber: 'CMD-2024003',
    customerName: 'Paul Martin',
    rating: 3,
    comment: 'La qualité est correcte mais peut être améliorée.',
    createdAt: new Date('2024-03-08')
  },
  {
    id: '4',
    orderNumber: 'CMD-2024004',
    customerName: 'Lucie Bernard',
    rating: 5,
    comment: 'Très satisfait, SAV réactif.',
    createdAt: new Date('2024-03-10')
  },
  {
    id: '5',
    orderNumber: 'CMD-2024005',
    customerName: 'Thomas Durand',
    rating: 2,
    comment: 'Déçu de la qualité du produit.',
    createdAt: new Date('2024-03-12')
  },
  {
    id: '6',
    orderNumber: 'CMD-2024006',
    customerName: 'Isabelle Petit',
    rating: 4,
    comment: 'Bon rapport qualité/prix.',
    createdAt: new Date('2024-03-15')
  },
  {
    id: '7',
    orderNumber: 'CMD-2024007',
    customerName: 'Hugo Leroy',
    rating: 5,
    comment: 'Top ! Je recommanderai sans hésiter.',
    createdAt: new Date('2024-03-18')
  },
  {
    id: '8',
    orderNumber: 'CMD-2024008',
    customerName: 'Emma Moreau',
    rating: 1,
    comment: 'Produit arrivé endommagé.',
    createdAt: new Date('2024-03-20')
  },
  {
    id: '9',
    orderNumber: 'CMD-2024009',
    customerName: 'Louis Garnier',
    rating: 4,
    comment: 'Livraison un peu longue mais produit parfait.',
    createdAt: new Date('2024-03-22')
  },
  {
    id: '10',
    orderNumber: 'CMD-2024010',
    customerName: 'Camille Robert',
    rating: 5,
    comment: 'Service client au top, merci !',
    createdAt: new Date('2024-03-25')
  }
];

export const useReviews = (options?: UseReviewsOptions) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ReviewMeta | null>(null);

  const { page = 1, limit = 10 } = options || {};

  const loadReviews = useCallback(async (opts?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const currentPage = opts?.page || page;
      const currentLimit = opts?.limit || limit;

      const start = (currentPage - 1) * currentLimit;
      const end = start + currentLimit;
      const paginated = mockReviews.slice(start, end);

      setReviews(paginated);
      setMeta({
        currentPage,
        lastPage: Math.ceil(mockReviews.length / currentLimit),
        perPage: currentLimit,
        total: mockReviews.length
      });
    } catch (err) {
      setError('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const clearError = useCallback(() => setError(null), []);

  const refreshReviews = useCallback(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Mettre à jour un avis
  const updateReview = useCallback(async (id: string, data: Partial<Review>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = mockReviews.findIndex((r) => r.id === id);
      if (index !== -1) {
        mockReviews[index] = {
          ...mockReviews[index],
          ...data,
        } as Review;
        await loadReviews();
        return true;
      }
      throw new Error('Avis introuvable');
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'avis');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  // Supprimer un avis
  const deleteReview = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = mockReviews.findIndex((r) => r.id === id);
      if (index !== -1) {
        mockReviews.splice(index, 1);
        await loadReviews();
        return true;
      }
      throw new Error('Avis introuvable');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'avis');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  return { reviews, loading, error, meta, loadReviews, clearError, refreshReviews, updateReview, deleteReview };
}; 