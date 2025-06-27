import { useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '../services/userService';
import type { 
  User, 
  CreateUserInput, 
  UpdateUserInput, 
  GetUsersParams,
  UsersResponse 
} from '../types/user';

interface UseUsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  } | null;
}

export const useUsers = (initialParams?: GetUsersParams) => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: false,
    error: null,
    meta: null,
  });

  // Utiliser useRef pour stocker les paramètres sans déclencher de re-rendu
  const paramsRef = useRef(initialParams);

  // Charger la liste des utilisateurs
  const loadUsers = useCallback(async (params?: GetUsersParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Vérifier si un token existe avant de faire l'appel
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState({
          users: [],
          meta: null,
          loading: false,
          error: null,
        });
        return;
      }
      
      const response: UsersResponse = await userService.getUsers(params || paramsRef.current);
      setState({
        users: response.users,
        meta: response.meta,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      // Ne pas afficher d'erreur si c'est une erreur 401 (sera gérée par l'interceptor)
      if (error.response?.status !== 401) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs',
          loading: false,
        }));
      } else {
        setState({
          users: [],
          meta: null,
          loading: false,
          error: null,
        });
      }
    }
  }, []);

  // Créer un utilisateur
  const createUser = useCallback(async (input: CreateUserInput) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Debug: Logger les données envoyées
      console.log('🔍 Données envoyées à /users/create-user:', input);
      
      await userService.createUser(input);
      // Recharger la liste après création
      await loadUsers(paramsRef.current);
      return true;
    } catch (error) {
      // Debug: Logger l'erreur complète
      console.error('❌ Erreur complète de création:', error);
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la création',
        loading: false,
      }));
      return false;
    }
  }, [loadUsers]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (id: number, input: UpdateUserInput) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await userService.updateUser(id, input);
      // Recharger la liste après modification
      await loadUsers(paramsRef.current);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la modification',
        loading: false,
      }));
      return false;
    }
  }, [loadUsers]);

  // Supprimer un utilisateur
  const deleteUser = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await userService.deleteUser(id);
      // Recharger la liste après suppression
      await loadUsers(paramsRef.current);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        loading: false,
      }));
      return false;
    }
  }, [loadUsers]);

  // Envoyer un email de vérification
  const sendVerificationEmail = useCallback(async (email: string) => {
    try {
      await userService.sendVerificationEmail(email);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'email',
      }));
      return false;
    }
  }, []);

  // Charger les utilisateurs au montage du composant uniquement
  useEffect(() => {
    // Vérifier si un token existe avant de charger les données
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUsers(paramsRef.current);
    } else {
      setState({
        users: [],
        meta: null,
        loading: false,
        error: null,
      });
    }
  }, [loadUsers]);

  return {
    ...state,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    sendVerificationEmail,
    // Fonctions utilitaires
    clearError: () => setState(prev => ({ ...prev, error: null })),
    refreshUsers: () => loadUsers(paramsRef.current),
  };
}; 