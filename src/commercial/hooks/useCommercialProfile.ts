import { useState, useCallback } from 'react';
import type { User } from '../../types/user';
import { commercialUserService } from '../services/userService';

export const useCommercialProfile = (userId?: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { user: fetchedUser } = await commercialUserService.getUserById(userId);
      setUser(fetchedUser);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    user,
    loading,
    error,
    refresh: fetchProfile,
  };
}; 