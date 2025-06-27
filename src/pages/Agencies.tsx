import React, { useState } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, MapPin, Phone, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAgencies } from '../hooks/useAgencies';
import type { Agency, CreateAgencyInput } from '../types/agency';
import { useToast } from '../contexts/ToastContext';
import AgencyModal from '../components/features/AgencyModal';
import ConfirmModal from '../components/features/ConfirmModal';

// Fonction utilitaire de formatage de date
const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const Agencies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showInfo } = useToast();

  // Hook personnalisé
  const {
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
  } = useAgencies({ page: currentPage, limit: itemsPerPage });

  // Filtrer les agences
  const filteredAgencies = agencies?.filter((agency) => {
    const term = searchTerm.toLowerCase();
    return (
      agency.name.toLowerCase().includes(term) ||
      agency.address?.toLowerCase().includes(term) ||
      agency.city?.toLowerCase().includes(term) ||
      agency.country?.toLowerCase().includes(term)
    );
  }) || [];

  // Pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || (meta && page > meta.lastPage)) return;
    setCurrentPage(page);
    loadAgencies({ page, limit: itemsPerPage });
  };

  const generatePageNumbers = () => {
    if (!meta || meta.lastPage <= 1) return [];
    const pages: (number | string)[] = [];
    const totalPages = meta.lastPage;

    pages.push(1);
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  // Actions non implémentées
  const handleCreate = () => {
    setSelectedAgency(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (agency: Agency) => {
    setSelectedAgency(agency);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (agency: Agency) => {
    setConfirmDelete(agency);
  };

  const handleSubmit = async (data: CreateAgencyInput) => {
    if (modalMode === 'create') {
      const success = await createAgency(data);
      if (success) {
        showInfo('Agence créée avec succès');
        setIsModalOpen(false);
      }
    } else if (modalMode === 'edit' && selectedAgency) {
      const success = await updateAgency(selectedAgency.id, data);
      if (success) {
        showInfo('Agence mise à jour avec succès');
        setIsModalOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold">×</button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 size={36} className="text-emerald-600 bg-emerald-100 rounded-md p-1" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mes agences</h1>
            {meta && (
              <p className="text-sm text-gray-500 mt-1">{meta.total} agence{meta.total > 1 ? 's' : ''} au total</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAgencies}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Actualiser
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Nouvelle agence
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom, adresse, ville ou pays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grille des agences */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Erreur de chargement</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={refreshAgencies} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              Réessayer
            </button>
          </div>
        ) : !agencies || agencies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucune agence</p>
            <p className="text-gray-500 text-sm">Il n'y a pas encore d'agences enregistrées dans le système.</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucun résultat</p>
            <p className="text-gray-500">Aucune agence ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredAgencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} onEdit={handleEdit} onDelete={handleDeleteRequest} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.lastPage > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-700">Page {currentPage} sur {meta.lastPage}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === meta.lastPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>{' '}à{' '}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, meta.total)}</span>{' '}sur{' '}
                      <span className="font-medium">{meta.total}</span>{' '}résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {generatePageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === meta.lastPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal agence */}
      <AgencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        agency={selectedAgency}
        mode={modalMode}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={confirmDelete !== null}
        onClose={() => !isDeleting && setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          setIsDeleting(true);
          const success = await deleteAgency(confirmDelete.id);
          setIsDeleting(false);
          if (success) {
            showInfo('Agence supprimée avec succès');
            setConfirmDelete(null);
          }
        }}
        title="Supprimer l'agence"
        message={`Êtes-vous sûr de vouloir supprimer l'agence "${confirmDelete?.name ?? ''}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface AgencyCardProps {
  agency: Agency;
  onEdit: (agency: Agency) => void;
  onDelete: (agency: Agency) => void;
}

const AgencyCard: React.FC<AgencyCardProps> = ({ agency, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Nom et localisation */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Building2 size={26} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{agency.name}</h3>
              <p className="text-sm text-gray-500">{agency.city}{agency.city && agency.country ? ', ' : ''}{agency.country}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(agency)} className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer" title="Modifier">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(agency)} className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors cursor-pointer" title="Supprimer">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Adresse */}
        {agency.address && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin size={14} />
            <span>{agency.address}</span>
          </div>
        )}
        {/* Téléphone */}
        {agency.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Phone size={14} />
            <span>{agency.phoneNumber}</span>
          </div>
        )}

        {/* Dates */}
        <div className="pt-4 border-t mt-4 text-xs text-gray-400">
          Créée le {formatDate(agency.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default Agencies; 