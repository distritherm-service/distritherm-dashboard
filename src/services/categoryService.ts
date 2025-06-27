import { apiClient } from './apiConfig';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category';

interface CategoriesResponse {
  categories: Category[];
  message: string;
}

// Récupérer toutes les catégories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<CategoriesResponse>('/categories');
    return response.data.categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

// Créer une nouvelle catégorie
export const createCategory = async (categoryInput: CreateCategoryInput): Promise<Category> => {
  try {
    // Générer l'alias automatiquement si non fourni
    const categoryData = {
      ...categoryInput,
      alias: categoryInput.alias || categoryInput.name.toLowerCase().replace(/\s+/g, '-')
    };
    
    const response = await apiClient.post<{ category: Category; message: string }>('/categories', categoryData);
    return response.data.category;
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    throw error;
  }
};

// Mettre à jour une catégorie
export const updateCategory = async (id: number, category: UpdateCategoryInput): Promise<Category> => {
  try {
    const response = await apiClient.put<{ category: Category }>(`/categories/${id}`, category);
    return response.data.category;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  // Valider l'ID
  if (!id || isNaN(id)) {
    throw new Error('ID de catégorie invalide');
  }

  try {
    console.log(`[DELETE] Suppression de la catégorie ${id}`);
    const response = await apiClient.delete(`/categories/${id}`);
    
    console.log(`[DELETE] Réponse:`, response.status, response.data);
    
    // Gérer les différents codes de statut de succès
    if ([200, 201, 204].includes(response.status)) {
      // Si la réponse contient un message
      if (response.data?.message) {
        return { message: response.data.message };
      }
      
      // Message par défaut si pas de message dans la réponse
      return { message: 'Catégorie supprimée avec succès' };
    }
    
    // Si on arrive ici, c'est une réponse inattendue
    throw new Error(`Réponse inattendue du serveur: ${response.status}`);
    
  } catch (error: any) {
    // Log détaillé pour le débogage
    console.error('Erreur de suppression complète:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    // Si c'est une erreur de réseau ou autre
    if (!error.response) {
      throw new Error('Erreur de connexion au serveur');
    }
    
    // Gestion des erreurs HTTP
    const status = error.response.status;
    const errorData = error.response.data;
    const errorMessage = errorData?.message || errorData?.error || 'Erreur lors de la suppression';
    
    switch (status) {
      case 401:
        // L'intercepteur devrait déjà gérer cela, mais au cas où
        throw new Error('Session expirée. Veuillez vous reconnecter');
        
      case 403:
        throw new Error('Vous n\'avez pas les droits pour supprimer cette catégorie');
        
      case 404:
        throw new Error('Catégorie non trouvée');
        
      case 400:
        // Cas spécifique : catégorie avec des sous-catégories
        if (errorMessage.toLowerCase().includes('sous-catégories') || 
            errorMessage.toLowerCase().includes('sous-catégorie') ||
            errorMessage.toLowerCase().includes('children')) {
          throw new Error('Impossible de supprimer cette catégorie car elle contient des sous-catégories. Supprimez d\'abord les sous-catégories.');
        }
        throw new Error(errorMessage || 'Données invalides');
        
      case 409:
        throw new Error('Conflit : ' + errorMessage);
        
      default:
        throw new Error(errorMessage || `Erreur serveur (${status})`);
    }
  }
}; 