// Types pour la gestion des devis (quotes)
// Status du devis
export type QuoteStatus = 'SENDED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'PROGRESS' | 'CONSULTED';
// Type pour les produits dans le panier
export interface CartItem {
  id: number;
  quantity: number;
  /**
   * Prix TTC pour l\'ensemble de la ligne du panier (quantité * prix unitaire TTC).
   * N\'est pas toujours présent – dans ce cas, le prix sera calculé à partir du produit.
   */
  priceTtc?: number;
  /**
   * Prix HT pour l\'ensemble de la ligne du panier. Optionnel.
   */
  priceHt?: number;
  /**
   * Identifiant du produit (présent dans la réponse API mais pas toujours utile côté front).
   */
  productId?: number;
  product: {
    id: number;
    name: string;
    price: number;
    isFavorited: boolean;
    isInPromotion: boolean;
    promotionPrice?: number;
    promotionEndDate?: string;
    promotionPercentage?: number;
  };
}
// Type pour l'utilisateur du panier
export interface CartUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  siretNumber?: string;
}

// Type pour le panier
export interface Cart {
  id: number;
  user: CartUser;
  cartItems: CartItem[];
  /**
   * Prix total TTC du panier renvoyé directement par l\'API. Si présent, il est prioritaire pour le calcul du devis.
   */
  totalPrice?: number;
}
// Type pour le commercial
export interface Commercial {
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
// Type principal pour un devis
export interface Quote {
  id: number;
  status: QuoteStatus;
  fileUrl?: string;
  endDate?: string;
  cartId: number;
  commercialId?: number;
  createdAt: string;
  updatedAt: string;
  commercial?: Commercial;
  cart: Cart;
}
// Type pour la méta-information de pagination
export interface QuoteMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

// Type pour la réponse de l'API
export interface QuotesResponse {
  message: string;
  devis: Quote[];
  count: number;
  meta: QuoteMeta;
}

// Type pour les paramètres de requête
export interface GetQuotesParams {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
  commercialId?: number;
}

// Type pour créer un devis
export interface CreateQuoteInput {
  cartId: number;
  commercialId?: number;
  endDate?: string;
  fileUrl?: string;
}

// Type pour mettre à jour un devis
export interface UpdateQuoteInput {
  status?: QuoteStatus;
  commercialId?: number;
  endDate?: string;
  fileUrl?: string;
}

// Type pour la réponse d'un devis unique
export interface QuoteResponse {
  message: string;
  devis: Quote;
} 