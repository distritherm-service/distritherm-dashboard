import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { User } from '../types/user';

type AppUser = User & { name: string };

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Les identifiants ne sont plus stockés en dur, l'auth se fait via l'API

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        try {
          const { user: profile } = await userService.getCurrentUser();
          const appUser: AppUser = { ...profile, name: `${profile.firstName} ${profile.lastName}` };
          setUser(appUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(appUser));
        } catch (error) {
          console.error('Erreur de récupération du profil:', error);
          logout();
        }
      } else {
        // Fallback pour le mode dev si l'utilisateur est en localStorage sans token
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser) as AppUser;
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Erreur lors de la lecture des données utilisateur:', error);
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      const { accessToken, refreshToken } = response;

      // Stocker les tokens
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Récupérer ensuite le profil complet (rôle compris)
      const { user: profile } = await userService.getCurrentUser();
      const appUser: AppUser = { ...profile, name: `${profile.firstName} ${profile.lastName}` };

      localStorage.setItem('user', JSON.stringify(appUser));
      setUser(appUser);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      // Propager l'erreur pour que le composant Login puisse l'afficher
      throw error;
    }
  };

  const logout = () => {
    // Nettoyer complètement l'état et le localStorage
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    authService.logout();
    // La navigation sera gérée par le composant qui appelle logout
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 