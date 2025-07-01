import { useState, useEffect, useCallback } from 'react';
import type { Agency, AgencyMeta, CreateAgencyInput, UpdateAgencyInput } from '../types/agency';
import { agencyService, type GetAgenciesParams } from '../services/agencyService';

interface UseAgenciesOptions extends GetAgenciesParams {}

export const useAgencies = (options?: UseAgenciesOptions) => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<AgencyMeta | null>(null);

  const { page = 1, limit = 10 } = options || {};

  // Chargement des agences depuis l'API
  const loadAgencies = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = params?.page ?? page;
      const currentLimit = params?.limit ?? limit;

      const { agencies: fetchedAgencies, meta: apiMeta } = await agencyService.getAgencies({ page: currentPage, limit: currentLimit });

      // Si l'API ne renvoie pas de pagination, on la calcule côté client
      if (apiMeta) {
        setMeta({
          currentPage: apiMeta.page,
          lastPage: apiMeta.lastPage,
          perPage: apiMeta.limit,
          total: apiMeta.total,
        });
        setAgencies(fetchedAgencies);
      } else {
        const total = fetchedAgencies.length;
        setMeta({
          currentPage: 1,
          lastPage: 1,
          perPage: total,
          total,
        });
        setAgencies(fetchedAgencies);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des agences');
      setAgencies([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Actualiser les agences
  const refreshAgencies = useCallback(() => {
    loadAgencies();
  }, [loadAgencies]);

  // Créer une nouvelle agence
  const createAgency = useCallback(async (data: CreateAgencyInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const newAgency = await agencyService.createAgency(data);
      // insertion optimiste
      setAgencies((prev) => [newAgency, ...prev]);
      setMeta((prev) => prev ? { ...prev, total: prev.total + 1 } : prev);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'agence');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une agence
  const updateAgency = useCallback(async (id: string, data: UpdateAgencyInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await agencyService.updateAgency(id, data);
      await loadAgencies();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de l\'agence');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAgencies]);

  // Supprimer une agence
  const deleteAgency = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await agencyService.deleteAgency(id);
      await loadAgencies();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'agence');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAgencies]);

  // Charger au montage
  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  return {
    agencies,
    loading,
    error,
    meta,
    loadAgencies,
    createAgency,
    updateAgency,
    deleteAgency,
    clearError,
    refreshAgencies,
  };
}; 