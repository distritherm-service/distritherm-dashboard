import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { 
  QuotesResponse,
  QuoteResponse,
  GetQuotesParams,
  CreateQuoteInput,
  UpdateQuoteInput
} from '../types/quote';

// Service pour la gestion des devis via l'API REST
export const quoteService = {
  /**
   * Récupérer la liste paginée des devis
   * GET /devis
   */
  async getQuotes(params?: GetQuotesParams): Promise<QuotesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.commercialId) {
        queryParams.append('commercialId', params.commercialId.toString());
      }

      const endpoint = queryParams.toString() ? `/devis?${queryParams.toString()}` : '/devis';
      const response = await apiClient.get<QuotesResponse>(endpoint);
      
      // Debug en développement
      if (import.meta.env.DEV) {
        console.log('📋 Devis récupérés:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Récupérer un devis par son ID
   * GET /devis/{id}
   */
  async getQuoteById(id: number): Promise<QuoteResponse> {
    try {
      const response = await apiClient.get<QuoteResponse>(`/devis/${id}`);
      
      // Debug en développement
      if (import.meta.env.DEV) {
        console.log(`📋 Devis ${id} récupéré:`, response.data);
      }
      
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Créer un nouveau devis
   * POST /devis
   */
  async createQuote(input: CreateQuoteInput): Promise<QuoteResponse> {
    try {
      // Debug: Logger la tentative de création
      if (import.meta.env.DEV) {
        console.log('📝 Création d\'un nouveau devis:', input);
      }

      const response = await apiClient.post<QuoteResponse>('/devis', input);
      
      // Debug: Logger le succès
      if (import.meta.env.DEV) {
        console.log('✅ Devis créé avec succès:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Debug: Logger l'erreur complète en développement
      if (import.meta.env.DEV && axiosError.response) {
        console.error('🔴 Erreur de création de devis:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
      }
      
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },

  /**
   * Mettre à jour un devis
   * PUT /devis/{id}
   * 
   * @param id - ID du devis à modifier
   * @param input - Données à mettre à jour
   * @returns Devis mis à jour
   */
  async updateQuote(id: number, input: UpdateQuoteInput): Promise<QuoteResponse> {
    try {
      // Debug: Logger la tentative de modification
      if (import.meta.env.DEV) {
        console.log(`✏️ Modification du devis ${id}:`, input);
      }

      // Nettoyer les champs vides
      const cleanedInput = Object.entries(input).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          acc[key as keyof UpdateQuoteInput] = value;
        }
        return acc;
      }, {} as UpdateQuoteInput);

      const response = await apiClient.put<QuoteResponse>(`/devis/${id}`, cleanedInput);
      
      // Debug: Logger le succès
      if (import.meta.env.DEV) {
        console.log('✅ Devis modifié avec succès:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Debug: Logger l'erreur complète en développement
      if (import.meta.env.DEV && axiosError.response) {
        console.error('🔴 Erreur de modification de devis:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
      }
      
      // Gestion des erreurs spécifiques
      if (axiosError.response?.status === 404) {
        throw new Error(`Le devis avec l'ID ${id} n'existe pas`);
      }
      
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },

  /**
   * Supprimer un devis
   * DELETE /devis/{id}
   * 
   * @param id - ID du devis à supprimer
   * @returns Message de confirmation
   */
  async deleteQuote(id: number): Promise<{ message: string }> {
    try {
      // Debug: Logger la tentative de suppression
      if (import.meta.env.DEV) {
        console.log(`🗑️ Suppression du devis ${id}`);
      }

      const response = await apiClient.delete<{ message: string }>(`/devis/${id}`);
      
      // Debug: Logger le succès
      if (import.meta.env.DEV) {
        console.log('✅ Devis supprimé avec succès:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Debug: Logger l'erreur complète en développement
      if (import.meta.env.DEV && axiosError.response) {
        console.error('🔴 Erreur de suppression de devis:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
      }
      
      // Gestion des erreurs spécifiques
      if (axiosError.response?.status === 404) {
        throw new Error(`Le devis avec l'ID ${id} n'existe pas`);
      }
      
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },

  /**
   * Télécharger le fichier d'un devis
   * @param fileUrl - URL du fichier à télécharger
   * @returns Blob du fichier
   */
  async downloadQuoteFile(fileUrl: string): Promise<Blob> {
    try {
      const response = await apiClient.get(fileUrl, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(`Erreur lors du téléchargement du fichier: ${message}`);
    }
  }
}; 