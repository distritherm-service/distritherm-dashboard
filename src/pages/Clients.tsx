import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, Shield, User as UserIcon, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import type { User, CreateUserInput, UpdateUserInput } from '../types/user';
import UserModal from '../components/features/UserModal';
import ConfirmModal from '../components/features/ConfirmModal';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selfDeleteError, setSelfDeleteError] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  // Récupérer l'utilisateur actuel depuis le contexte Auth
  const { user: currentUser } = useAuth();

  // Utiliser le hook personnalisé
  const {
    users,
    loading,
    error,
    meta,
    createUser,
    updateUser,
    deleteUser,
    loadUsers,
    clearError,
    refreshUsers
  } = useUsers({ page: currentPage, limit: itemsPerPage });

  // Réinitialiser la page lors du changement du nombre d'éléments par page
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    loadUsers({ page: 1, limit: newLimit });
  };

  // Filtrer les utilisateurs
  const filteredUsers = users?.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phoneNumber.includes(searchTerm)
    );
  }) || [];

  // Ouvrir le modal de création
  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const handleEdit = (user: User) => {
    // Vérifier les permissions : seul l'utilisateur lui-même ou un admin peut modifier
    if (currentUser) {
      if (currentUser.role !== 'ADMIN' && currentUser.id !== user.id) {
        setPermissionError('Vous n\'êtes pas autorisé à modifier les informations de cet utilisateur');
        // Masquer le message après 5 secondes
        setTimeout(() => setPermissionError(null), 5000);
        return;
      }
    }
    
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (data: CreateUserInput) => {
    clearError(); // Effacer les erreurs précédentes
    
    try {
      let success = false;
      
      if (modalMode === 'create') {
        success = await createUser(data);
        // L'email de vérification est envoyé automatiquement par l'API
        if (success) {
          // Afficher un message de succès temporaire
          const successMessage = 'Utilisateur créé avec succès';
          console.log('✅', successMessage);
        }
      } else if (selectedUser) {
        // Nettoyer les données pour ne pas envoyer de champs vides
        const updateData: UpdateUserInput = {};
        
        if (data.firstName && data.firstName !== selectedUser.firstName) {
          updateData.firstName = data.firstName;
        }
        if (data.lastName && data.lastName !== selectedUser.lastName) {
          updateData.lastName = data.lastName;
        }
        if (data.email && data.email !== selectedUser.email) {
          updateData.email = data.email;
        }
        if (data.phoneNumber && data.phoneNumber !== selectedUser.phoneNumber) {
          updateData.phoneNumber = data.phoneNumber;
        }
        if (data.role && data.role !== selectedUser.role) {
          updateData.role = data.role;
        }
        if (data.companyName !== undefined && data.companyName !== selectedUser.companyName) {
          updateData.companyName = data.companyName;
        }
        if (data.siretNumber !== undefined && data.siretNumber !== selectedUser.siretNumber) {
          updateData.siretNumber = data.siretNumber;
        }
        if (data.urlPicture !== undefined && data.urlPicture !== selectedUser.urlPicture) {
          updateData.urlPicture = data.urlPicture;
        }
        
        // Ne faire l'appel API que s'il y a des changements
        if (Object.keys(updateData).length > 0) {
          success = await updateUser(selectedUser.id, updateData);
          if (success) {
            // Afficher un message de succès temporaire
            const successMessage = 'Utilisateur modifié avec succès';
            console.log('✅', successMessage);
          }
        } else {
          // Pas de changements détectés
          console.log('ℹ️ Aucune modification détectée');
          setIsModalOpen(false);
          return;
        }
      }
      
      if (success) {
        setIsModalOpen(false);
        clearError();
      }
    } catch (error) {
      // Les erreurs sont déjà gérées par le hook useUsers et affichées dans l'interface
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  };

  // Confirmer la suppression
  const handleDeleteClick = (user: User) => {
    // Vérifier si l'utilisateur tente de supprimer son propre compte
    if (currentUser && user.id === currentUser.id) {
      setSelfDeleteError(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setSelfDeleteError(false), 5000);
      return;
    }
    
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Supprimer l'utilisateur
  const handleDelete = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        clearError();
      }
    }
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || (meta && page > meta.lastPage)) return;
    setCurrentPage(page);
    loadUsers({ page, limit: itemsPerPage });
  };

  // Générer les numéros de page à afficher
  const generatePageNumbers = () => {
    if (!meta || meta.lastPage <= 1) return [];
    
    const pages = [];
    const totalPages = meta.lastPage;
    const current = currentPage;
    
    // Toujours afficher la première page
    pages.push(1);
    
    // Afficher les pages autour de la page actuelle
    const startPage = Math.max(2, current - 2);
    const endPage = Math.min(totalPages - 1, current + 2);
    
    // Ajouter ... si nécessaire
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Ajouter les pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Ajouter ... si nécessaire
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Toujours afficher la dernière page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Formater la date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Message d'erreur pour la tentative de suppression de son propre compte */}
      {selfDeleteError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>Vous ne pouvez pas supprimer votre propre compte. Pour désactiver votre compte, veuillez contacter un administrateur.</span>
          </div>
          <button 
            onClick={() => setSelfDeleteError(false)}
            className="text-amber-500 hover:text-amber-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Message d'erreur pour les permissions insuffisantes */}
      {permissionError && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} />
            <span>{permissionError}</span>
          </div>
          <button 
            onClick={() => setPermissionError(null)}
            className="text-orange-500 hover:text-orange-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
            {meta && (
              <p className="text-sm text-gray-500 mt-1">
                {meta.total} utilisateur{meta.total > 1 ? 's' : ''} au total
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshUsers}
            className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <RefreshCcw size={18} />
            Actualiser
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Nouveau client
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Afficher:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Erreur de chargement</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={refreshUsers}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-8 text-center">
            <UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucun utilisateur</p>
            <p className="text-gray-500 text-sm">
              Il n'y a pas encore d'utilisateurs enregistrés dans le système.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Aucun résultat</p>
            <p className="text-gray-500">
              Aucun utilisateur ne correspond à votre recherche "{searchTerm}"
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-700 font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail size={14} className="text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {user.phoneNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield size={12} />
                          {user.role === 'ADMIN' ? 'Administrateur' : 'Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            disabled={!!(currentUser && currentUser.role !== 'ADMIN' && currentUser.id !== user.id)}
                            className={`p-1 rounded transition-colors ${
                              currentUser && currentUser.role !== 'ADMIN' && currentUser.id !== user.id
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50 cursor-pointer'
                            }`}
                            title={
                              currentUser && currentUser.role !== 'ADMIN' && currentUser.id !== user.id
                                ? 'Permissions insuffisantes pour modifier cet utilisateur'
                                : 'Modifier'
                            }
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            disabled={!!(currentUser && user.id === currentUser.id)}
                            className={`p-1 rounded transition-colors ${
                              currentUser && user.id === currentUser.id
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={
                              currentUser && user.id === currentUser.id
                                ? 'Vous ne pouvez pas supprimer votre propre compte'
                                : 'Supprimer'
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <span className="text-sm text-gray-700">
                    Page {currentPage} sur {meta.lastPage}
                  </span>
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
                      <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                      {' '}à{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, meta.total)}
                      </span>
                      {' '}sur{' '}
                      <span className="font-medium">{meta.total}</span>
                      {' '}résultats
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
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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

      {/* Modal utilisateur */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
        mode={modalMode}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete?.firstName} ${userToDelete?.lastName} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default Clients; 