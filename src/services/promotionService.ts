import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { Product } from '../types/product';

/** Paramètres autorisés pour la récupération des promotions */
export interface GetPromotionsParams {
  page?: number;
  limit?: number;
}

/**
 * Structure de la réponse renvoyée par le backend pour la liste des produits en promotion
 */
interface PromotionsApiResponse {
  products: Array<{
    id: number;
    name: string;
    priceHt: number;
    priceTtc: number;
    quantity: number;
    imagesUrl?: string[];
    description?: string | null;
    categoryId: number;
    markId: number;
    category?: { id: number; name: string };
    mark?: { id: number; name: string };
    isInPromotion: boolean;
    promotionPrice: number;
    promotionEndDate?: string | null;
    promotionPercentage?: number | null;
    isFavorited?: boolean;
  }>;
  meta?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
  message: string;
}

export const promotionService = {
  /**
   * GET /products/promotions
   */
  async getPromotions(params?: GetPromotionsParams): Promise<{ products: Product[]; meta?: PromotionsApiResponse['meta'] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      const endpoint = queryParams.toString() ? `/products/promotions?${queryParams.toString()}` : '/products/promotions';

      const response = await apiClient.get<PromotionsApiResponse>(endpoint);

      // Mapping vers le type Product du front
      const products: Product[] = response.data.products.map((item) => ({
        id: item.id,
        name: item.name,
        // SKU: provisoire (backend ne le fournit pas encore)
        sku: `SKU-${item.id}`,
        price: item.promotionPrice, // Prix actuel = prix promotionnel
        compareAtPrice: item.priceTtc, // Ancien prix barré
        priceHt: item.priceHt,
        priceTtc: item.priceTtc,
        promotionPrice: item.promotionPrice,
        promotionEndDate: item.promotionEndDate || undefined,
        promotionPercentage: item.promotionPercentage || undefined,
        isInPromotion: item.isInPromotion,
        isFavorited: item.isFavorited,
        quantity: item.quantity,
        imageUrl: item.imagesUrl?.[0],
        images: item.imagesUrl,
        imagesUrl: item.imagesUrl,
        description: item.description || undefined,
        brandId: item.markId,
        brandName: item.mark?.name,
        categoryId: item.categoryId,
        categoryName: item.category?.name,
        // On considère toutes les promotions comme actives tant qu'elles sont renvoyées par l'API
        isActive: true,
        isFeatured: false,
        tags: [],
        createdAt: new Date(),
        updatedAt: item.promotionEndDate ? new Date(item.promotionEndDate) : new Date(),
      }));

      return {
        products,
        meta: response.data.meta,
      };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },
}; 