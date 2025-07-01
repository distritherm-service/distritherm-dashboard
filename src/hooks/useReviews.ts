import { useState, useEffect, useCallback } from 'react';
import type { Review, ReviewMeta } from '../types/review';
import { reviewService, type GetReviewsParams } from '../services/reviewService';

interface UseReviewsOptions extends GetReviewsParams {}

export const useReviews = (options?: UseReviewsOptions) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ReviewMeta | null>(null);

  const { page = 1, limit = 10, status } = options || {};

  // Chargement des avis depuis l'API
  const loadReviews = useCallback(async (params?: { page?: number; limit?: number; status?: GetReviewsParams['status'] }) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = params?.page ?? page;
      const currentLimit = params?.limit ?? limit;
      const currentStatus = params?.status ?? status;

      const { reviews: fetched, meta: apiMeta } = await reviewService.getReviews({ page: currentPage, limit: currentLimit, status: currentStatus });

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

      setReviews(fetched);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des avis');
      setReviews([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  const clearError = useCallback(() => setError(null), []);

  const refreshReviews = useCallback(() => {
    loadReviews();
  }, [loadReviews]);

  // Mettre à jour un avis
  const updateReview = useCallback(async (id: number, data: Partial<{ comment: string; status: 'PENDING' | 'VALIDED' | 'DENIED'; rating: number }>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Conversion rating -> star attendu par l'API
      const payload: any = { ...data };
      if ('rating' in payload) {
        payload.star = payload.rating;
        delete payload.rating;
      }
      await reviewService.updateReview(id, payload);
      await loadReviews();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de l\'avis');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  // Supprimer un avis
  const deleteReview = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await reviewService.deleteReview(id);
      await loadReviews();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'avis');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return { reviews, loading, error, meta, loadReviews, clearError, refreshReviews, updateReview, deleteReview };
}; 