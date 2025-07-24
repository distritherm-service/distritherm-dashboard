import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from '../../services/apiConfig';
import type { UserResponse } from '../../types/user';

/**
 * Service REST dédié à l’espace Commercial pour la récupération
 * de données utilisateur (lecture uniquement pour l’instant).
 */
export const commercialUserService = {
  /**
   * Récupérer un utilisateur par son ID.
   * GET /users/{id}
   */
  async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  }
}; 