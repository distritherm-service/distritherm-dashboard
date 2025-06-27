import { AxiosError } from 'axios';
import { apiClient, handleApiError, type ApiError } from './apiConfig';
import type { 
  CreateUserInput, 
  UpdateUserInput, 
  GetUsersParams,
  UsersResponse,
  UserResponse,
  VerifyEmailParams,
  VerifyEmailResponse
} from '../types/user';

// Service pour la gestion des utilisateurs via l'API REST
export const userService = {
  /**
   * Récupérer la liste paginée des utilisateurs
   * GET /users
   */
  async getUsers(params?: GetUsersParams): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const endpoint = queryParams.toString() ? `/users?${queryParams.toString()}` : '/users';
      const response = await apiClient.get<UsersResponse>(endpoint);
      
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Créer un nouvel utilisateur (Admin uniquement)
   * POST /users/create-user
   */
  async createUser(input: CreateUserInput): Promise<UserResponse> {
    try {
      const response = await apiClient.post<UserResponse>('/users/create-user', input);
      return response.data;
    } catch (error) {
      // Debug: Logger l'erreur complète pour comprendre le problème
      if ((error as AxiosError).response) {
        const axiosError = error as AxiosError<any>;
        console.error('🔴 Erreur API createUser:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers
        });
      }
      
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Mettre à jour un utilisateur
   * PUT /users/{id}
   * 
   * Accessible uniquement par l'utilisateur lui-même ou un administrateur.
   * Permet de modifier toutes les informations personnelles optionnelles.
   * 
   * @param id - ID unique de l'utilisateur à modifier
   * @param input - Données à mettre à jour (tous les champs sont optionnels)
   *   - firstName: Prénom (1-50 caractères)
   *   - lastName: Nom de famille (1-50 caractères)
   *   - email: Adresse email (format valide requis)
   *   - phoneNumber: Numéro de téléphone français (+33XXXXXXXXX)
   *   - urlPicture: URL de l'image de profil (formats: jpg, jpeg, png, webp)
   *   - companyName: Nom de l'entreprise (1-100 caractères) - clients uniquement
   *   - siretNumber: Numéro SIRET (exactement 14 chiffres) - clients uniquement
   * 
   * @returns Utilisateur mis à jour avec toutes ses informations
   * @throws Error avec le message d'erreur approprié:
   *   - 400: Mauvaise requête - Données invalides ou malformées
   *   - 401: Non autorisé - Token invalide, manquant ou expiré
   *   - 403: Accès refusé - Permissions insuffisantes pour modifier cet utilisateur
   *   - 404: L'utilisateur spécifié n'existe pas dans le système
   *   - 409: Conflit de données - Un utilisateur avec cet email existe déjà
   *   - 422: Erreurs de validation des données fournies
   */
  async updateUser(id: number, input: UpdateUserInput): Promise<UserResponse> {
    try {
      // Debug: Logger la tentative de modification
      if (import.meta.env.DEV) {
        console.log(`✏️ Tentative de modification de l'utilisateur ID: ${id}`, input);
      }

      // Nettoyer les champs vides ou non modifiés
      const cleanedInput = Object.entries(input).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          acc[key as keyof UpdateUserInput] = value;
        }
        return acc;
      }, {} as UpdateUserInput);

      const response = await apiClient.put<UserResponse>(`/users/${id}`, cleanedInput);
      
      // Debug: Logger le succès
      if (import.meta.env.DEV) {
        console.log('✅ Utilisateur modifié avec succès:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Debug: Logger l'erreur complète en développement
      if (import.meta.env.DEV && axiosError.response) {
        console.error('🔴 Erreur de modification d\'utilisateur:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
      }
      
      // Gestion des erreurs spécifiques à la modification d'utilisateur
      if (axiosError.response?.status === 403) {
        // Cas spécifique : permissions insuffisantes
        throw new Error('Vous n\'êtes pas autorisé à modifier les informations de cet utilisateur');
      } else if (axiosError.response?.status === 404) {
        // Cas spécifique : utilisateur introuvable
        throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`);
      } else if (axiosError.response?.status === 409) {
        // Cas spécifique : conflit d'email
        throw new Error('Un utilisateur avec cet email existe déjà');
      } else if (axiosError.response?.status === 422) {
        // Cas spécifique : erreurs de validation
        const validationError = axiosError.response.data;
        if (validationError?.message) {
          throw new Error(validationError.message);
        }
        throw new Error('Erreurs de validation des données fournies');
      }
      
      // Pour les autres erreurs, utiliser le handler générique
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },

  /**
   * Supprimer un utilisateur
   * DELETE /users/{id}
   * 
   * Accessible uniquement par un administrateur ou l'utilisateur lui-même.
   * Un utilisateur ne peut pas supprimer son propre compte.
   * 
   * @param id - ID de l'utilisateur à supprimer
   * @returns Message de confirmation de suppression
   * @throws Error avec le message d'erreur approprié:
   *   - 400: Mauvaise requête - Données invalides ou malformées
   *   - 401: Non autorisé - Token invalide, manquant ou expiré
   *   - 403: Vous ne pouvez pas supprimer votre propre compte
   *   - 404: L'utilisateur n'existe pas
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    try {
      // Debug: Logger la tentative de suppression
      if (import.meta.env.DEV) {
        console.log(`🗑️ Tentative de suppression de l'utilisateur ID: ${id}`);
      }

      const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
      
      // Debug: Logger le succès
      if (import.meta.env.DEV) {
        console.log('✅ Utilisateur supprimé avec succès:', response.data);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Debug: Logger l'erreur complète en développement
      if (import.meta.env.DEV && axiosError.response) {
        console.error('🔴 Erreur de suppression d\'utilisateur:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
      }
      
      // Gestion des erreurs spécifiques à la suppression d'utilisateur
      if (axiosError.response?.status === 403) {
        // Cas spécifique : tentative de suppression de son propre compte
        throw new Error('Vous ne pouvez pas supprimer votre propre compte');
      } else if (axiosError.response?.status === 404) {
        // Cas spécifique : utilisateur introuvable
        throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`);
      }
      
      // Pour les autres erreurs, utiliser le handler générique
      const message = handleApiError(axiosError);
      throw new Error(message);
    }
  },

  /**
   * Récupérer un utilisateur par son ID
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
  },

  /**
   * Vérifier l'email d'un utilisateur
   * GET /users/verify-email
   */
  async verifyEmail(params: VerifyEmailParams): Promise<VerifyEmailResponse> {
    try {
      const response = await apiClient.get<VerifyEmailResponse>(
        `/users/verify-email`,
        {
          params: {
            token: params.token
          }
        }
      );
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  },

  /**
   * Envoyer un email de vérification
   * POST /users/send-verification
   */  
  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/users/send-verification',
        { email }
      );
      return response.data;
    } catch (error) {
      const message = handleApiError(error as AxiosError<ApiError>);
      throw new Error(message);
    }
  }
}; 