export interface Review {
  id: string;
  orderNumber: string; // Numéro de la commande associée
  customerName: string; // Nom du client
  rating: number; // Note de 1 à 5
  comment: string; // Commentaire laissé par le client
  createdAt: Date; // Date de création de l'avis
}

export interface ReviewMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} 