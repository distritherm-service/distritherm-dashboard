import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { Brand, CreateBrandInput, UpdateBrandInput } from '../types/brand';

/**
 * Paramètres autorisés pour la récupération des marques
 */
export interface GetBrandsParams {
  page?: number;
  limit?: number;
}

/**
 * Structure de la réponse du backend pour la liste des marques
 * L'API retourne actuellement un tableau "marks" et éventuellement un objet meta.
 */
interface BrandsApiResponse {
  marks: Array<{
    id: number;
    name: string;
    logo?: string | null;
    description?: string | null;
    website?: string | null;
    country?: string | null;
    isActive?: boolean | null;
    products?: unknown[];
    productsCount?: number | null;
    createdAt: string;
    updatedAt: string;
  }>;
  meta?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
  message: string;
}

/**
 * Service dédié à la gestion des marques
 */
export const brandService = {
  /**
   * Récupère la liste paginée (ou complète) des marques
   * GET /marks
   */
  async getBrands(params?: GetBrandsParams): Promise<{ brands: Brand[]; meta?: BrandsApiResponse['meta'] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = queryParams.toString() ? `/marks?${queryParams.toString()}` : '/marks';
      const response = await apiClient.get<BrandsApiResponse>(endpoint);

      // Mapping API -> Front types
      const brands: Brand[] = response.data.marks.map((mark) => ({
        id: mark.id.toString(),
        name: mark.name,
        logo: mark.logo || undefined,
        description: mark.description || undefined,
        website: mark.website || undefined,
        country: mark.country || undefined,
        isActive: mark.isActive ?? true,
        productsCount: mark.productsCount ?? 0,
        createdAt: new Date(mark.createdAt),
        updatedAt: new Date(mark.updatedAt),
      }));

      return { brands, meta: response.data.meta };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Crée une nouvelle marque
   * POST /marks
   */
  async createBrand(input: CreateBrandInput): Promise<Brand> {
    try {
      const response = await apiClient.post<{
        mark: BrandsApiResponse['marks'][number];
        message: string;
      }>('/marks', { name: input.name });

      const mark = response.data.mark;
      return {
        id: mark.id.toString(),
        name: mark.name,
        logo: mark.logo || undefined,
        description: mark.description || undefined,
        website: mark.website || undefined,
        country: mark.country || undefined,
        isActive: mark.isActive ?? true,
        productsCount: mark.products?.length ?? mark.productsCount ?? 0,
        createdAt: new Date(mark.createdAt),
        updatedAt: new Date(mark.updatedAt),
      };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Met à jour une marque
   */
  async updateBrand(id: string | number, input: UpdateBrandInput): Promise<Brand> {
    try {
      // Pour l'instant le backend n'accepte que la propriété « name » pour la mise à jour.
      // On extrait donc uniquement ce champ pour éviter les erreurs 500.
      const payload = input.name !== undefined ? { name: input.name } : {};

      const response = await apiClient.put<{
        mark: BrandsApiResponse['marks'][number];
        message: string;
      }>(`/marks/${id}`, payload);

      const mark = response.data.mark;
      return {
        id: mark.id.toString(),
        name: mark.name,
        logo: mark.logo || undefined,
        description: mark.description || undefined,
        website: mark.website || undefined,
        country: mark.country || undefined,
        isActive: mark.isActive ?? true,
        productsCount: mark.products?.length ?? mark.productsCount ?? 0,
        createdAt: new Date(mark.createdAt),
        updatedAt: new Date(mark.updatedAt),
      };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Supprime une marque
   */
  async deleteBrand(id: string | number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/marks/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },
}; 