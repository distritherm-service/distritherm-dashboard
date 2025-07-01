export interface Review {
  id: number; // Identifiant du commentaire
  rating: number; // Note (1 à 5)
  comment: string; // Contenu du commentaire
  status: 'PENDING' | 'VALIDED' | 'DENIED'; // Statut côté modération
  createdAt: Date | string; // Date de création
  updatedAt?: Date | string; // Date de mise à jour
  userId: number; // Identifiant de l'utilisateur
  productId: number; // Identifiant du produit
  customerName: string; // Nom complet du client (firstName + lastName)
  orderNumber?: string; // Champ conservé pour compatibilité UI: on y place le nom du produit
  productName?: string; // Nom du produit
}

export interface ReviewMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} 