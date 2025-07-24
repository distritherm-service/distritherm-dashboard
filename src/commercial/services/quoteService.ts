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
  async uploadQuoteFile(id: number, base64File: string, endDate: string): Promise<QuoteResponse> {
    try {
      // Nettoyer le base64 - enlever le préfixe si présent
      let cleanBase64 = base64File;
      if (base64File.includes('data:')) {
        cleanBase64 = base64File.split(',')[1];
      }
      
      // Calculer la taille réelle du fichier original (base64 est ~33% plus grand)
      const base64SizeBytes = cleanBase64.length;
      const originalSizeBytes = Math.round(base64SizeBytes * 0.75);
      const originalSizeKB = Math.round(originalSizeBytes / 1024);
      const originalSizeMB = originalSizeKB / 1024;
      
      if (import.meta.env.DEV) {
        console.log('📤 Upload devis - Informations complètes:', {
          id: id,
          endDate: endDate,
          base64Length: cleanBase64.length,
          base64First30Chars: cleanBase64.substring(0, 30) + '...',
          originalSizeKB: originalSizeKB,
          originalSizeMB: originalSizeMB.toFixed(2) + ' MB',
          base64SizeKB: Math.round(base64SizeBytes / 1024),
          base64SizeMB: (base64SizeBytes / 1024 / 1024).toFixed(2) + ' MB'
        });
      }

      // Vérifier que le fichier n'est pas trop gros (10 MB max pour le fichier original)
      if (originalSizeMB > 10) {
        throw new Error(`Le fichier est trop volumineux (${originalSizeMB.toFixed(1)} MB). La taille maximale est de 10 MB.`);
      }

      // Préparer le payload avec le bon format
      const payload = { 
        id: Number(id), // S'assurer que l'ID est un nombre
        endDate: endDate,
        file: cleanBase64 // Base64 sans le préfixe
      };

      if (import.meta.env.DEV) {
        console.log('📤 Envoi du payload:', {
          id: payload.id,
          idType: typeof payload.id,
          endDate: payload.endDate,
          fileLength: payload.file.length,
          payloadTotalSize: JSON.stringify(payload).length
        });
      }

      // Envoyer la requête avec une configuration appropriée
      const response = await apiClient.post<QuoteResponse>('/devis/file', payload, {
        timeout: 120000, // 2 minutes pour les gros fichiers
        headers: {
          'Content-Type': 'application/json'
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
        if (errorMessage.includes('fichier PDF est requis')) {
          throw new Error('Le fichier PDF n\'a pas été correctement envoyé. Veuillez réessayer.');
        }
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

  /**
   * Upload du fichier PDF correspondant à un devis (version FormData)
   * POST /devis/file
   */
  async uploadQuoteFileFormData(id: number, file: File, endDate: string): Promise<QuoteResponse> {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('endDate', endDate);
      formData.append('file', file, file.name);

      if (import.meta.env.DEV) {
        console.log('📤 Upload FormData:', {
          id: id,
          endDate: endDate,
          fileName: file.name,
          fileSize: file.size,
          fileSizeKB: Math.round(file.size / 1024),
          fileSizeMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          fileType: file.type
        });
      }

      const response = await apiClient.post<QuoteResponse>('/devis/file', formData, {
        timeout: 120000, // 2 minutes
        headers: {
          // Laisser axios gérer le Content-Type pour FormData
        }
      });
      
      if (import.meta.env.DEV) {
        console.log('✅ Upload FormData réussi:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      if (import.meta.env.DEV) {
        console.error('🚨 Upload FormData ERROR:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          errorMessage: axiosError.message
        });
      }
      
      // Propager l'erreur pour qu'elle soit gérée par le composant
      if (axiosError.response?.status === 413) {
        throw new Error('Le fichier est trop volumineux pour le serveur.');
      }
      
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.message || 'Erreur de validation';
        throw new Error(errorMessage);
      }
      
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },
}; 