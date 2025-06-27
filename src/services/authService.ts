import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { User } from '../types/user';

/**
 * Interfaces des réponses du backend
 */
interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  message: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  message: string;
}

/**
 * Service centralisant tous les appels liés à l'authentification
 */
export const authService = {
  /**
   * Connexion de l'utilisateur ⇒ POST /auth/regular-login
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/regular-login', input, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Rafraîchir le token d'accès ⇒ POST /auth/refresh-token
   * Le refreshToken peut être envoyé via cookie httpOnly ou comme paramètre
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      // Vérifier d'abord si on a un token d'accès
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Aucun token d\'accès trouvé');
      }

      const response = await apiClient.post<RefreshTokenResponse>(
        '/auth/refresh-token',
        {},
        {
          withCredentials: true,
          // Marquer cette requête pour qu'elle ne soit pas interceptée
          headers: {
            'X-Skip-Interceptor': 'true'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      // Si c'est une erreur 401, essayer avec le refresh token en paramètre
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await apiClient.post<RefreshTokenResponse>(
              '/auth/refresh-token',
              {},
              {
                params: { refresh_token: refreshToken },
                withCredentials: true,
                // Marquer cette requête pour qu'elle ne soit pas interceptée
                headers: {
                  'X-Skip-Interceptor': 'true'
                }
              }
            );
            
            return response.data;
          } catch (retryError) {
            const message = handleApiError(retryError as AxiosError<ApiError>);
            throw new Error(message);
          }
        }
      }
      
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Déconnexion locale de l'utilisateur
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}; 