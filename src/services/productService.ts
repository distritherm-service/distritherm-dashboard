import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { Product, CreateProductInput, UpdateProductInput } from '../types/product';

/** Paramètres autorisés pour la récupération des produits */
export interface GetProductsParams {
  page?: number;
  limit?: number;
}

/**
 * Structure de la réponse renvoyée par le backend pour la liste des produits
 */
interface ProductsApiResponse {
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
    active?: boolean;
    // Détails imbriqués
    productDetail?: {
      id: number;
      productId: number;
      itemCode?: string;
      directorWord1?: string;
      directorWord2?: string;
      designation1?: string;
      designation2?: string;
      complementDesignation?: string;
      packaging?: string;
      packagingType?: string;
      submissionFgaz?: string;
      fgazFile?: string;
      active?: boolean;
      label?: string;
      unity?: string;
      weight?: number;
      familyCode?: string;
      ecoContributionPercentage?: number;
      ecoContributionApplication?: boolean;
    };
    // Champs plats éventuels (legacy)
    itemCode?: string;
    directorWord1?: string;
    directorWord2?: string;
    designation1?: string;
    designation2?: string;
    complementDesignation?: string;
    packaging?: string;
    packagingType?: string;
    submissionFgaz?: string;
    fgazFile?: string;
    label?: string;
    unity?: string;
    weight?: number;
    familyCode?: string;
    ecoContributionPercentage?: number;
    ecoContributionApplication?: boolean;
    isInPromotion?: boolean;
    promotionPrice?: number | null;
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

export const productService = {
  /**
   * GET /products
   */
  async getProducts(params?: GetProductsParams): Promise<{ products: Product[]; meta?: ProductsApiResponse['meta'] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      const endpoint = queryParams.toString() ? `/products?${queryParams.toString()}` : '/products';
      const response = await apiClient.get<ProductsApiResponse>(endpoint);

      const products: Product[] = response.data.products
        .map((item) => {
          const detail: any = item.productDetail ?? {};
          return {
            id: item.id,
            name: item.name,
            sku: item.itemCode || `SKU-${item.id}`,
            // Mapping du prix : on privilégie le prix promotionnel s'il existe
            price: item.isInPromotion && item.promotionPrice ? item.promotionPrice : item.priceTtc,
            compareAtPrice: item.isInPromotion ? item.priceTtc : undefined,
            priceHt: item.priceHt,
            priceTtc: item.priceTtc,
            promotionPrice: item.promotionPrice || undefined,
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
            isActive: item.active !== undefined ? item.active : true,
            isFeatured: false,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            itemCode: detail.itemCode ?? item.itemCode,
            directorWord1: detail.directorWord1 ?? item.directorWord1,
            directorWord2: detail.directorWord2 ?? item.directorWord2,
            designation1: detail.designation1 ?? item.designation1,
            designation2: detail.designation2 ?? item.designation2,
            complementDesignation: detail.complementDesignation ?? item.complementDesignation,
            packaging: detail.packaging ?? item.packaging,
            packagingType: detail.packagingType ?? item.packagingType,
            submissionFgaz: detail.submissionFgaz ?? item.submissionFgaz,
            fgazFile: detail.fgazFile ?? item.fgazFile,
            label: detail.label ?? item.label,
            unity: detail.unity ?? item.unity,
            weight: detail.weight ?? item.weight,
            familyCode: detail.familyCode ?? item.familyCode,
            ecoContributionPercentage: detail.ecoContributionPercentage ?? item.ecoContributionPercentage,
            ecoContributionApplication: detail.ecoContributionApplication ?? item.ecoContributionApplication,
          };
        })
        .sort((a, b) => b.id - a.id);

      return {
        products,
        meta: response.data.meta,
      };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * POST /products
   */
  async createProduct(input: CreateProductInput): Promise<void> {
    try {
      const body = {
        name: input.name,
        priceHt: input.priceHt,
        priceTtc: input.priceTtc,
        quantity: input.quantity,
        imagesUrl: input.imagesUrl,
        description: input.description,
        categoryId: input.categoryId,
        markId: input.brandId,
        productDetail: {
          itemCode: input.itemCode,
          directorWord1: input.directorWord1,
          directorWord2: input.directorWord2,
          designation1: input.designation1,
          designation2: input.designation2,
          complementDesignation: input.complementDesignation,
          packaging: input.packaging,
          packagingType: input.packagingType,
          submissionFgaz: input.submissionFgaz,
          fgazFile: input.fgazFile,
          active: input.isActive,
          label: input.label,
          unity: input.unity,
          weight: input.weight,
          familyCode: input.familyCode,
          ecoContributionPercentage: input.ecoContributionPercentage,
          ecoContributionApplication: input.ecoContributionApplication,
        },
      };

      await apiClient.post('/products', body);
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * PUT /products/{id}
   */
  async updateProduct(id: number | string, input: UpdateProductInput): Promise<void> {
    try {
      const body: any = {
        name: input.name,
        priceHt: input.priceHt,
        priceTtc: input.priceTtc,
        quantity: input.quantity,
        imagesUrl: input.imagesUrl,
        description: input.description,
        categoryId: input.categoryId,
        markId: input.brandId,
        productDetail: {
          itemCode: input.itemCode,
          directorWord1: input.directorWord1,
          directorWord2: input.directorWord2,
          designation1: input.designation1,
          designation2: input.designation2,
          complementDesignation: input.complementDesignation,
          packaging: input.packaging,
          packagingType: input.packagingType,
          submissionFgaz: input.submissionFgaz,
          fgazFile: input.fgazFile,
          active: input.isActive,
          label: input.label,
          unity: input.unity,
          weight: input.weight,
          familyCode: input.familyCode,
          ecoContributionPercentage: input.ecoContributionPercentage,
          ecoContributionApplication: input.ecoContributionApplication,
        },
      };

      await apiClient.put(`/products/${id}`, body);
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * DELETE /products/{id}
   */
  async deleteProduct(id: number | string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/products/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },
}; 