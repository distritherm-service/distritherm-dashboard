import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from '../../services/apiConfig';
import type { QuotesResponse, QuoteResponse, GetQuotesParams } from '../../types/quote';

/**
 * Service des devis côté COMMERCIAL.
 * Toutes les requêtes sont préfixées par /devis/by-commercial/{commercialId}
 */
export const commercialQuoteService = {
  /**
   * Liste des devis du commercial connecté
   */
  async getQuotes(commercialId: number, params?: Omit<GetQuotesParams, 'commercialId'>): Promise<QuotesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const endpoint = `/devis/by-commercial/${commercialId}`;
      const finalEndpoint = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;

      const response = await apiClient.get<QuotesResponse>(finalEndpoint);
      if (import.meta.env.DEV) {
        console.log('📋 Devis commercial récupérés:', response.data);
      }
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Détail d'un devis (le commercial a accès seulement à ses devis)
   */
  async getQuoteById(commercialId: number, id: number): Promise<QuoteResponse> {
    try {
      const response = await apiClient.get<QuoteResponse>(`/devis/by-commercial/${commercialId}/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Téléchargement du fichier PDF
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
   * Upload du fichier PDF correspondant à un devis
   * POST /devis/file
   */
  async uploadQuoteFile(id: number, file: File, endDate: string): Promise<QuoteResponse> {
    try {
      // Vérifier la taille du fichier (10 MB max)
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 10) {
        throw new Error(`Le fichier est trop volumineux (${fileSizeMB.toFixed(1)} MB). La taille maximale est de 10 MB.`);
      }

      // Créer FormData avec les données requises
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('endDate', endDate);
      formData.append('file', file, file.name);

      if (import.meta.env.DEV) {
        console.log('📤 Upload devis avec FormData:', {
          id: id,
          endDate: endDate,
          fileName: file.name,
          fileSize: file.size,
          fileSizeKB: Math.round(file.size / 1024),
          fileSizeMB: fileSizeMB.toFixed(2) + ' MB',
          fileType: file.type
        });
      }

      // Envoyer la requête avec FormData
      const response = await apiClient.post<QuoteResponse>('/devis/file', formData, {
        timeout: 120000, // 2 minutes pour les gros fichiers
        headers: {
          // Laisser axios gérer automatiquement le Content-Type pour FormData
          // (il ajoutera multipart/form-data avec boundary)
        }
      });
      
      if (import.meta.env.DEV) {
        console.log('✅ Upload réussi:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (import.meta.env.DEV) {
        console.error('🚨 Upload ERROR - Détails complets:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          errorMessage: axiosError.message,
          errorCode: axiosError.code,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            headers: axiosError.config?.headers
          }
        });
      }
      
      // Erreur de validation côté client
      if (error instanceof Error && error.message.includes('trop volumineux')) {
        throw error;
      }
      
      // Erreur 413 - Payload trop large
      if (axiosError.response?.status === 413) {
        throw new Error('Le fichier est trop volumineux pour le serveur. Veuillez réduire la taille du PDF.');
      }
      
      // Erreur 400 - Bad Request
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.message || 'Erreur de validation';
        throw new Error(errorMessage);
      }
      
      // Timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Le délai d\'envoi a expiré. Vérifiez votre connexion internet et réessayez.');
      }
      
      // Autres erreurs
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },
}; 