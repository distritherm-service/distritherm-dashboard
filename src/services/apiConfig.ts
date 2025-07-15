import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

// URL de base de l'API (aucun proxy requis)
export const BASE_API_URL = 'https://distritherm-backend.onrender.com';

// Types pour la réponse API
export interface ApiResponse<T> {
  data?: T;
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
  message: string;
}

// Types d'erreur API
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

// Instance Axios configurée
export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'x-platform': 'web',
  },
  withCredentials: true,
});

// Ajout d'un intercepteur de requête pour injecter le token d'accès
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si les données ne sont PAS un formulaire, on définit le Content-Type en JSON.
    // Pour les FormData, Axios s'en chargera et ajoutera la "boundary" nécessaire.
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Flag & file d'attente pour éviter de lancer plusieurs refresh simultanés
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur de réponse pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignorer l'intercepteur si la requête est marquée
    if (originalRequest?.headers?.['X-Skip-Interceptor'] === 'true') {
      return Promise.reject(error);
    }

    // Si pas de token et erreur 401, rejeter directement sans tenter de rafraîchir
    const token = localStorage.getItem('accessToken');
    if (!token && error.response?.status === 401) {
      return Promise.reject(error);
    }

    // Tentative de rafraîchissement si 401 (token expiré)
    if (error.response?.status === 401 && !originalRequest._retry && token) {
      // Vérifier si on est déjà sur la page de login pour éviter les boucles
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // On met la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (typeof token === 'string') {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await authService.refreshToken();
        localStorage.setItem('accessToken', accessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Si le refresh échoue, déconnecter l'utilisateur et rediriger vers la page de connexion
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Rediriger vers la page de connexion seulement si on n'y est pas déjà
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gestion des erreurs communes déjà présente
    const status = error.response?.status;
    if (status === 401) {
      console.warn('Erreur 401 - Non autorisé');
    } else if (status === 403) {
      console.error('Accès refusé - Droits insuffisants');
    } else if (status === 404) {
      console.error('Ressource non trouvée');
    } else if (status && status >= 500) {
      console.error('Erreur serveur');
    }

    return Promise.reject(error);
  }
);

// Helper pour gérer les erreurs API
export const handleApiError = (error: AxiosError<ApiError>): string => {
  const status = error.response?.status;
  
  // Gestion des messages d'erreur spécifiques selon le code de statut
  if (status === 400) {
    return error.response?.data?.message || 'Données invalides ou malformées';
  } else if (status === 401) {
    return error.response?.data?.message || 'Non autorisé - Token invalide ou manquant';
  } else if (status === 403) {
    return error.response?.data?.message || 'Accès refusé - Droits administrateur requis';
  } else if (status === 409) {
    return error.response?.data?.message || 'Un utilisateur avec cet email existe déjà';
  } else if (status === 422) {
    return error.response?.data?.message || 'Erreurs de validation des données fournies';
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
}; 