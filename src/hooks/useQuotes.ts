import { useState, useEffect, useCallback, useRef } from 'react';
import { quoteService } from '../services/quoteService';
import type { 
  Quote, 
  GetQuotesParams,
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteMeta
} from '../types/quote';

interface UseQuotesState {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  meta: QuoteMeta | null;
}

export const useQuotes = (initialParams?: GetQuotesParams) => {
  const [state, setState] = useState<UseQuotesState>({
    quotes: [],
    loading: false,
    error: null,
    meta: null,
  });

  // Utiliser useRef pour stocker les paramètres sans déclencher de re-rendu
  const paramsRef = useRef(initialParams);

  // Charger la liste des devis
  const loadQuotes = useCallback(async (params?: GetQuotesParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Vérifier si un token existe avant de faire l'appel
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState({
          quotes: [],
          meta: null,
          loading: false,
          error: null,
        });
        return;
      }
      
      const response = await quoteService.getQuotes(params || paramsRef.current);
      setState({
        quotes: response.devis,
        meta: response.meta,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      // Ne pas afficher d'erreur si c'est une erreur 401 (sera gérée par l'interceptor)
      if (error.response?.status !== 401) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erreur lors du chargement des devis',
          loading: false,
        }));
      } else {
        setState({
          quotes: [],
          meta: null,
          loading: false,
          error: null,
        });
      }
    }
  }, []);

  // Récupérer un devis par son ID
  const getQuoteById = useCallback(async (id: number) => {
    try {
      const response = await quoteService.getQuoteById(id);
      return response.devis;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération du devis',
      }));
      return null;
    }
  }, []);

  // Créer un devis
  const createQuote = useCallback(async (input: CreateQuoteInput) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await quoteService.createQuote(input);
      // Recharger la liste après création
      await loadQuotes(paramsRef.current);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la création du devis',
        loading: false,
      }));
      return false;
    }
  }, [loadQuotes]);

  // Mettre à jour un devis
  const updateQuote = useCallback(async (id: number, input: UpdateQuoteInput) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await quoteService.updateQuote(id, input);
      // Recharger la liste après modification
      await loadQuotes(paramsRef.current);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la modification du devis',
        loading: false,
      }));
      return false;
    }
  }, [loadQuotes]);

  // Supprimer un devis
  const deleteQuote = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await quoteService.deleteQuote(id);
      // Recharger la liste après suppression
      await loadQuotes(paramsRef.current);
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du devis',
        loading: false,
      }));
      return false;
    }
  }, [loadQuotes]);

  // Télécharger le fichier d'un devis
  const downloadQuoteFile = useCallback(async (fileUrl: string, fileName: string) => {
    try {
      const blob = await quoteService.downloadQuoteFile(fileUrl);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur lors du téléchargement du fichier',
      }));
      return false;
    }
  }, []);

  /**
   * Calcule le total TTC d'un devis.
   * Priorité des sources :
   *   1. `quote.cart.totalPrice` s'il est fourni par l'API.
   *   2. Somme des `priceTtc` sur chaque ligne de panier.
   *   3. Calcul à partir du prix du produit (en tenant compte d'une éventuelle promotion).
   */
  const calculateQuoteTotal = useCallback((quote: Quote): number => {
    // 1. Total direct du panier
    if (typeof quote.cart.totalPrice === 'number') {
      return quote.cart.totalPrice;
    }

    // 2. Somme des priceTtc si présents
    let hasPriceTtc = quote.cart.cartItems.every((item) => typeof item.priceTtc === 'number');
    if (hasPriceTtc) {
      return quote.cart.cartItems.reduce((sum, item) => sum + (item.priceTtc || 0), 0);
    }

    // 3. Fallback : calculer à partir du produit
    return quote.cart.cartItems.reduce((total, item) => {
      const priceUnit = item.product.isInPromotion && item.product.promotionPrice
        ? item.product.promotionPrice
        : item.product.price;
      return total + (priceUnit * item.quantity);
    }, 0);
  }, []);

  // Charger les devis au montage du composant
  useEffect(() => {
    // Vérifier si un token existe avant de charger les données
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadQuotes(paramsRef.current);
    } else {
      setState({
        quotes: [],
        meta: null,
        loading: false,
        error: null,
      });
    }
  }, [loadQuotes]);

  return {
    ...state,
    loadQuotes,
    getQuoteById,
    createQuote,
    updateQuote,
    deleteQuote,
    downloadQuoteFile,
    calculateQuoteTotal,
    // Fonctions utilitaires
    clearError: () => setState(prev => ({ ...prev, error: null })),
    refreshQuotes: () => loadQuotes(paramsRef.current),
  };
}; 