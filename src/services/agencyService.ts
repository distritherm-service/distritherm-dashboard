import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { Agency } from '../types/agency';

/**
 * Paramètres autorisés pour la récupération des agences
 */
export interface GetAgenciesParams {
  page?: number;
  limit?: number;
}

/**
 * Structure de la réponse de l'API pour la liste des agences
 */
interface AgenciesApiResponse {
  agencies: Array<{
    id: number;
    name: string;
    address?: string | null;
    country?: string | null;
    city?: string | null;
    postalCode?: string | number | null;
    phoneNumber?: string | null;
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
 * Service dédié à la gestion des agences
 */
export const agencyService = {
  /**
   * Récupère la liste paginée (ou complète) des agences
   * GET /agencies
   */
  async getAgencies(params?: GetAgenciesParams): Promise<{ agencies: Agency[]; meta?: AgenciesApiResponse['meta'] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = queryParams.toString() ? `/agencies?${queryParams.toString()}` : '/agencies';
      const response = await apiClient.get<AgenciesApiResponse>(endpoint);

      // Mapping API -> Front types
      const agencies: Agency[] = response.data.agencies.map((agency) => ({
        id: agency.id.toString(),
        name: agency.name,
        address: agency.address || undefined,
        country: agency.country || undefined,
        city: agency.city || undefined,
        postalCode: agency.postalCode?.toString() || undefined,
        phoneNumber: agency.phoneNumber || undefined,
        createdAt: new Date(agency.createdAt),
        updatedAt: new Date(agency.updatedAt),
      }));

      return { agencies, meta: response.data.meta };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Crée une nouvelle agence
   * POST /agencies
   */
  async createAgency(input: import('../types/agency').CreateAgencyInput): Promise<Agency> {
    try {
      // Conversion éventuelle du code postal en nombre si fourni et convertible
      const payload = {
        ...input,
        postalCode:
          input.postalCode !== undefined && input.postalCode !== null && input.postalCode !== ''
            ? Number(input.postalCode)
            : undefined,
      };

      const response = await apiClient.post<{
        agency: AgenciesApiResponse['agencies'][number];
        message: string;
      }>(`/agencies`, payload);

      const agency = response.data.agency;
      return {
        id: agency.id.toString(),
        name: agency.name,
        address: agency.address || undefined,
        country: agency.country || undefined,
        city: agency.city || undefined,
        postalCode: agency.postalCode?.toString() || undefined,
        phoneNumber: agency.phoneNumber || undefined,
        createdAt: new Date(agency.createdAt),
        updatedAt: new Date(agency.updatedAt),
      };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Met à jour une agence
   * PUT /agencies/{id}
   */
  async updateAgency(id: string | number, input: import('../types/agency').UpdateAgencyInput): Promise<Agency> {
    try {
      // Conversion éventuelle du code postal en nombre si fourni
      const payload = {
        ...input,
        postalCode:
          input.postalCode !== undefined && input.postalCode !== null && input.postalCode !== ''
            ? Number(input.postalCode)
            : undefined,
      };

      const response = await apiClient.put<{
        agency: AgenciesApiResponse['agencies'][number];
        message: string;
      }>(`/agencies/${id}`, payload);

      const agency = response.data.agency;
      return {
        id: agency.id.toString(),
        name: agency.name,
        address: agency.address || undefined,
        country: agency.country || undefined,
        city: agency.city || undefined,
        postalCode: agency.postalCode?.toString() || undefined,
        phoneNumber: agency.phoneNumber || undefined,
        createdAt: new Date(agency.createdAt),
        updatedAt: new Date(agency.updatedAt),
      };
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Supprime une agence
   * DELETE /agencies/{id}
   */
  async deleteAgency(id: string | number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/agencies/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },
}; 