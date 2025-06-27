import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User, CreateUserInput, UpdateUserInput, GetUsersParams } from '../types/user';

interface UseClientsReturn {
  clients: User[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  } | null;
  createClient: (data: CreateUserInput) => Promise<boolean>;
  updateClient: (id: number, data: UpdateUserInput) => Promise<boolean>;
  deleteClient: (id: number) => Promise<boolean>;
  loadClients: (params?: GetUsersParams) => Promise<void>;
  clearError: () => void;
  refreshClients: () => Promise<void>;
}

export const useClients = (initialParams?: GetUsersParams): UseClientsReturn => {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  } | null>(null);
  const [lastParams, setLastParams] = useState<GetUsersParams | undefined>(initialParams);

  const loadClients = useCallback(async (params?: GetUsersParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si un token existe avant de faire l'appel
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setClients([]);
        setMeta(null);
        return;
      }
      
      const response = await userService.getUsersByRole('CLIENT', params);
      setClients(response.users);
      setMeta(response.meta);
      setLastParams(params);
    } catch (err: any) {
      // Ne pas afficher d'erreur si c'est une erreur 401 (sera gérée par l'interceptor)
      if (err.response?.status !== 401) {
        setError(err.message || 'Erreur lors du chargement des clients');
      }
      setClients([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (data: CreateUserInput): Promise<boolean> => {
    try {
      setError(null);
      // S'assurer que le rôle est bien CLIENT
      const clientData = { ...data, role: 'CLIENT' as const };
      await userService.createUser(clientData);
      await loadClients(lastParams);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du client');
      return false;
    }
  };

  const updateClient = async (id: number, data: UpdateUserInput): Promise<boolean> => {
    try {
      setError(null);
      await userService.updateUser(id, data);
      await loadClients(lastParams);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du client');
      return false;
    }
  };

  const deleteClient = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await loadClients(lastParams);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du client');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshClients = async () => {
    await loadClients(lastParams);
  };

  useEffect(() => {
    // Vérifier si un token existe avant de charger les données
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadClients(initialParams);
    } else {
      setLoading(false);
      setClients([]);
      setMeta(null);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    meta,
    createClient,
    updateClient,
    deleteClient,
    loadClients,
    clearError,
    refreshClients
  };
}; 