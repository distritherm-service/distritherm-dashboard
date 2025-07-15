import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';

export interface SendCampaignInput {
  /** Sujet de l'email */
  subject: string;
  /** Contenu HTML du message */
  content: string;
  /** Fichiers joints (10 max) */
  attachments?: File[];
}

/**
 * Service pour la gestion des campagnes marketing
 */
export const campaignService = {
  /**
   * Envoie une campagne email marketing à tous les utilisateurs
   * POST /campagnes/send
   */
  async sendCampaign(input: SendCampaignInput): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append('subject', input.subject);
      formData.append('content', input.content);
      if (input.attachments) {
        input.attachments.slice(0, 10).forEach((file) => {
          formData.append('attachments[]', file);
        });
      }

      const response = await apiClient.post<{ message: string }>(
        '/campagnes/send',
        formData
      );

      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },
}; 