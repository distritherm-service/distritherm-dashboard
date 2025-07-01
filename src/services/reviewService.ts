import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { Review } from '../types/review';

/** Paramètres autorisés pour la récupération des commentaires */
export interface GetReviewsParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'VALIDED' | 'DENIED';
}

interface ReviewsApiResponse {
  comments: Array<{
    id: number;
    comment: string;
    status: 'PENDING' | 'VALIDED' | 'DENIED';
    star: number;
    userId: number;
    productId: number;
    createdAt: string;
    updatedAt: string;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      type?: string;
      role?: string;
    };
    product?: {
      id: number;
      name: string;
      priceHt?: number;
      priceTtc?: number;
      quantity?: number;
      imagesUrl?: string[];
      description?: string;
      categoryId?: number;
      markId?: number;
      category?: { id: number; name: string };
      mark?: { id: number; name: string };
      isInPromotion?: boolean;
      promotionPrice?: number;
      promotionEndDate?: string;
      promotionPercentage?: number;
      isFavorited?: boolean;
    };
  }>;
  meta?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
  message: string;
  count?: number;
}

export const reviewService = {
  /**
   * GET /comments
   */
  async getReviews(params?: GetReviewsParams): Promise<{ reviews: Review[]; meta?: ReviewsApiResponse['meta'] }> {
    try {
      // Construction des query params dynamiques
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const endpoint = queryParams.toString() ? `/comments?${queryParams.toString()}` : '/comments';
      const response = await apiClient.get<ReviewsApiResponse>(endpoint);

      const reviews: Review[] = response.data.comments.map((item) => ({
        id: item.id,
        comment: item.comment,
        rating: item.star,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userId: item.userId,
        productId: item.productId,
        customerName: item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Utilisateur inconnu',
        productName: item.product?.name,
        // Pour compatibilité avec l'UI existante, on place le nom du produit dans orderNumber
        orderNumber: item.product?.name ?? `PROD-${item.productId}`,
      }));

      return { reviews, meta: response.data.meta };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * PATCH /comments/{id}
   * Permet de mettre à jour le statut ou le contenu d'un commentaire.
   */
  async updateReview(id: number, data: Partial<{ comment: string; status: 'PENDING' | 'VALIDED' | 'DENIED'; star: number }>): Promise<void> {
    try {
      await apiClient.patch(`/comments/${id}`, data);
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * DELETE /comments/{id}
   */
  async deleteReview(id: number): Promise<void> {
    try {
      await apiClient.delete(`/comments/${id}`);
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },
}; 