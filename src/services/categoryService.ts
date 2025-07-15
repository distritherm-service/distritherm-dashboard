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

/**
 * Gère l'upload d'une image pour une catégorie et l'associe.
 * C'est une fonction séparée car l'API semble nécessiter une requête multipart
 * distincte de la requête de création/mise à jour (qui est en JSON).
 * @param categoryId - L'ID de la catégorie à laquelle associer l'image.
 * @param imageFile - Le fichier à uploader.
 */
const uploadCategoryImage = async (categoryId: number, imageFile: File): Promise<Category> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    // On utilise PATCH car c'est une mise à jour partielle de la ressource.
    // L'en-tête sera automatiquement géré par Axios grâce à notre config.
    const response = await apiClient.patch<{ category: Category }>(`/categories/${categoryId}`, formData);
    return response.data.category;
  } catch (error) {
    console.error(`Erreur lors de l'upload de l'image pour la catégorie ${categoryId}:`, error);
    // On propage l'erreur pour que l'UI puisse réagir.
    throw error;
  }
};

// Créer une nouvelle catégorie
export const createCategory = async (categoryInput: CreateCategoryInput): Promise<Category> => {
  try {
    const formData = new FormData();
    // On déstructure explicitement pour ne prendre que ce que l'API attend.
    const {
      imageFile,
      name,
      level,
      alias,
      haveParent,
      haveChildren,
      description,
      parentCategoryId,
      // On ignore volontairement agenceId et imageUrl qui sont pour le front-end.
    } = categoryInput;

    // L'image est obligatoire pour la création.
    if (!imageFile) {
      throw new Error("Une image est requise pour créer une catégorie.");
    }
    formData.append('image', imageFile);

    // Construction de l'objet de données à envoyer
    const dataToSend = {
      name,
      level,
      alias: alias || name.toLowerCase().replace(/\s+/g, '-'),
      haveParent: haveParent || false,
      haveChildren: haveChildren || false,
      description,
      parentCategoryId,
    };

    // Ajoute chaque champ défini au FormData.
    Object.entries(dataToSend).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await apiClient.post<{ category: Category; message: string }>('/categories', formData);
    return response.data.category;
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Mettre à jour une catégorie
export const updateCategory = async (id: number, categoryInput: UpdateCategoryInput): Promise<Category> => {
  try {
    const formData = new FormData();
    const {
      imageFile,
      name,
      description,
      parentCategoryId,
      alias,
      level,
      // on ignore imageUrl
    } = categoryInput;

    const metadata: Record<string, any> = { name, description, parentCategoryId, alias, level };

    // On envoie les métadonnées champ par champ.
    Object.entries(metadata).forEach(([key, value]) => {
      // On n'envoie que les champs qui ont une valeur, car c'est un PATCH
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Envoyer la nouvelle image si elle est fournie.
    if (imageFile) {
      formData.append('image', imageFile);
    }

    // Utiliser PATCH pour la mise à jour.
    const response = await apiClient.patch<{ category: Category }>(`/categories/${id}`, formData);
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