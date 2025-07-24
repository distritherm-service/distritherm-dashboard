import { useState, useCallback, useEffect } from 'react';
import { commercialQuoteService } from '../services/quoteService';
import { useAuth } from '../../contexts/AuthContext';
import type { Quote, GetQuotesParams, QuoteMeta } from '../../types/quote';

interface UseCommercialQuotesState {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  meta: QuoteMeta | null;
}

export const useCommercialQuotes = (initialParams?: Omit<GetQuotesParams, 'commercialId'>) => {
  const { user } = useAuth();
  const [state, setState] = useState<UseCommercialQuotesState>({
    quotes: [],
    loading: false,
    error: null,
    meta: null,
  });

  const commercialId = user?.id ?? 0;

  const loadQuotes = useCallback(async (params?: Omit<GetQuotesParams, 'commercialId'>) => {
    if (!commercialId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await commercialQuoteService.getQuotes(commercialId, params || initialParams);
      setState({ quotes: response.devis, meta: response.meta, loading: false, error: null });
    } catch (e: any) {
      setState(prev => ({ ...prev, loading: false, error: e instanceof Error ? e.message : 'Erreur' }));
    }
  }, [commercialId, initialParams]);

  useEffect(() => {
    loadQuotes(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadQuoteFile = useCallback(async (fileUrl: string, fileName: string) => {
    try {
      const blob = await commercialQuoteService.downloadQuoteFile(fileUrl);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Erreur lors du téléchargement' }));
    }
  }, []);

  return { ...state, loadQuotes, downloadQuoteFile, clearError: () => setState(prev => ({ ...prev, error: null })) };
}; 