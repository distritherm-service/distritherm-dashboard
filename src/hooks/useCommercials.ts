import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User, CreateUserInput, UpdateUserInput, GetUsersParams } from '../types/user';

interface UseCommercialsReturn {
  commercials: User[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  } | null;
  createCommercial: (data: CreateUserInput) => Promise<boolean>;
  updateCommercial: (id: number, data: UpdateUserInput) => Promise<boolean>;
  deleteCommercial: (id: number) => Promise<boolean>;
  loadCommercials: (params?: GetUsersParams) => Promise<void>;
  clearError: () => void;
  refreshCommercials: () => Promise<void>;
}

export const useCommercials = (initialParams?: GetUsersParams): UseCommercialsReturn => {
  const [commercials, setCommercials] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  } | null>(null);
  const [lastParams, setLastParams] = useState<GetUsersParams | undefined>(initialParams);

  const loadCommercials = useCallback(async (params?: GetUsersParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si un token existe avant de faire l'appel
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setCommercials([]);
        setMeta(null);
        return;
      }
      
      const response = await userService.getUsersByRole('COMMERCIAL', params);
      setCommercials(response.users);
      setMeta(response.meta);
      setLastParams(params);
    } catch (err: any) {
      // Ne pas afficher d'erreur si c'est une erreur 401 (sera gérée par l'interceptor)
      if (err.response?.status !== 401) {
        setError(err.message || 'Erreur lors du chargement des commerciaux');
      }
      setCommercials([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommercial = async (data: CreateUserInput): Promise<boolean> => {
    try {
      setError(null);
      // S'assurer que le rôle est bien COMMERCIAL
      const commercialData = { ...data, role: 'COMMERCIAL' as const };
      await userService.createUser(commercialData);
      await loadCommercials(lastParams);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du commercial');
      return false;
    }
  };

  const updateCommercial = async (id: number, data: UpdateUserInput): Promise<boolean> => {
    try {
      setError(null);
      await userService.updateUser(id, data);
      await loadCommercials(lastParams);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du commercial');
      return false;
    }
  };

  const deleteCommercial = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await loadCommercials(lastParams);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du commercial');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshCommercials = async () => {
    await loadCommercials(lastParams);
  };

  useEffect(() => {
    // Vérifier si un token existe avant de charger les données
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadCommercials(initialParams);
    } else {
      setLoading(false);
      setCommercials([]);
      setMeta(null);
    }
  }, []);

  return {
    commercials,
    loading,
    error,
    meta,
    createCommercial,
    updateCommercial,
    deleteCommercial,
    loadCommercials,
    clearError,
    refreshCommercials
  };
}; 