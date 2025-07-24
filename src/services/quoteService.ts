import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import axios from 'axios';
import type {
  QuotesResponse,
  QuoteResponse,
  GetQuotesParams,
} from '../types/quote';
import type { CreateQuoteInput, UpdateQuoteInput } from '../types/quote';

/**
 * Service centralisant toutes les requêtes liées aux devis (quotes).
 * – Admin : endpoints génériques (/devis, /devis/:id, …)
 * – Commercial : endpoints filtrés (/devis/by-commercial/:id)
 */
export const quoteService = {
  /**
   * Récupérer la liste paginée des devis.
   * – Admin : GET /devis
   * – Commercial : GET /devis/by-commercial/:commercialId
   */
  async getQuotes(params?: GetQuotesParams): Promise<QuotesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      // Déterminer l'endpoint selon la présence de commercialId
      let endpoint = '/devis';
      if (params?.commercialId) {
        endpoint = `/devis/by-commercial/${params.commercialId}`;
      }

      const finalEndpoint = queryParams.toString()
        ? `${endpoint}?${queryParams.toString()}`
        : endpoint;

      const response = await apiClient.get<QuotesResponse>(finalEndpoint);

      if (import.meta.env.DEV) {
        console.log('📋 Devis récupérés - Response complète:', response);
        console.log('📋 Devis récupérés - response.data:', response.data);
        console.log('📋 Premier devis:', response.data.devis?.[0]);
        console.log('📋 Commercial du premier devis:', response.data.devis?.[0]?.commercial);
      }

      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Récupérer le détail d'un devis
   * GET /devis/:id
   */
  async getQuoteById(id: number): Promise<QuoteResponse> {
    try {
      const response = await apiClient.get<QuoteResponse>(`/devis/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Créer un devis
   * POST /devis
   */
  async createQuote(input: CreateQuoteInput): Promise<QuoteResponse> {
    try {
      // Nettoyer l'input pour retirer les champs vides / undefined
      const cleanedInput = Object.entries(input).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as CreateQuoteInput);

      const response = await apiClient.post<QuoteResponse>('/devis', cleanedInput);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Mettre à jour un devis
   * PUT /devis/{id}
   * Permet notamment d'assigner un commercial (commercialId) ou de changer le statut / fichier / date de validité.
   */
  async updateQuote(id: number, input: UpdateQuoteInput): Promise<QuoteResponse> {
    try {
      console.log('🚀 UPDATE QUOTE - Début');
      console.log('🚀 ID:', id);
      console.log('🚀 Input brut:', input);
      console.log('🚀 Type commercialId:', typeof input.commercialId);
      
      // S'assurer que commercialId est un nombre si présent
      if (input.commercialId !== undefined) {
        input.commercialId = Number(input.commercialId);
        console.log('🚀 commercialId converti en nombre:', input.commercialId);
      }
      
      // Nettoyer l'input pour retirer les champs vides / undefined
      const cleanedInput = Object.entries(input).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as UpdateQuoteInput);

      console.log('🚀 Input nettoyé:', cleanedInput);
      console.log('🚀 JSON.stringify de l\'input:', JSON.stringify(cleanedInput));
      console.log('🚀 URL:', `/devis/${id}`);

      // PUT /devis/{id}
      const response = await apiClient.put<QuoteResponse>(`/devis/${id}`, cleanedInput);
      
      console.log('🚀 Réponse API complète:', response);
      console.log('🚀 Réponse data:', response.data);
      console.log('🚀 Devis dans la réponse:', response.data.devis);
      console.log('🚀 Commercial dans la réponse:', response.data.devis?.commercialId);
      
      // Vérifier si la mise à jour a réellement eu lieu
      if (input.commercialId && response.data.devis?.commercialId !== input.commercialId) {
        console.warn('⚠️ ATTENTION: Le commercialId n\'a pas été mis à jour!');
        console.warn('⚠️ Demandé:', input.commercialId, 'Reçu:', response.data.devis?.commercialId);
      }
      
      return response.data;
    } catch (error) {
      console.error('🚀 ERREUR UPDATE:', error);
      if (axios.isAxiosError(error)) {
        console.error('🚀 Response:', error.response?.data);
        console.error('🚀 Status:', error.response?.status);
        console.error('🚀 Headers:', error.response?.headers);
      }
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Supprimer un devis
   * DELETE /devis/{id}
   */
  async deleteQuote(id: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/devis/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Télécharger le fichier PDF d'un devis (fileUrl complet retourné par l'API)
   */
  async downloadQuoteFile(fileUrl: string): Promise<Blob> {
    try {
      const response = await apiClient.get(fileUrl, { responseType: 'blob' });
      return response.data as Blob;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Test : Mettre à jour un devis avec tous les champs
   * Cette méthode récupère d'abord le devis puis renvoie tous les champs
   */
  async updateQuoteComplete(id: number, input: UpdateQuoteInput): Promise<QuoteResponse> {
    try {
      console.log('🔧 UPDATE COMPLET - Récupération du devis actuel...');
      
      // 1. Récupérer le devis actuel
      const currentQuoteResponse = await this.getQuoteById(id);
      const currentQuote = currentQuoteResponse.devis;
      
      console.log('🔧 Devis actuel:', currentQuote);
      
      // 2. Créer un objet avec tous les champs
      const completeUpdate = {
        status: input.status || currentQuote.status,
        commercialId: input.commercialId !== undefined ? Number(input.commercialId) : currentQuote.commercialId,
        endDate: input.endDate || currentQuote.endDate,
        fileUrl: input.fileUrl || currentQuote.fileUrl,
        cartId: currentQuote.cartId // Toujours inclure cartId
      };
      
      console.log('🔧 Update complet:', completeUpdate);
      
      // 3. Envoyer la mise à jour
      const response = await apiClient.put<QuoteResponse>(`/devis/${id}`, completeUpdate);
      
      console.log('🔧 Réponse:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('🔧 Erreur update complet:', error);
      throw error;
    }
  },

  

  


 
}; 