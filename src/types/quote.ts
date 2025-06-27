// Types pour la gestion des devis (quotes)

// Status du devis
export type QuoteStatus = 'SENDED' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

// Type pour les produits dans le panier
export interface CartItem {
  id: number;
  quantity: number;
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
}

// Type pour le panier
export interface Cart {
  id: number;
  user: CartUser;
  cartItems: CartItem[];
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