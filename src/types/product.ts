export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  quantity: number;
  imageUrl?: string;
  images?: string[];
  imagesUrl?: string[];
  brandId: number;
  brandName?: string;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  specifications?: Record<string, string>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
  priceHt?: number;
  priceTtc?: number;
  promotionPrice?: number;
  promotionEndDate?: string;
  promotionPercentage?: number;
  isInPromotion?: boolean;
  isFavorited?: boolean;
  itemCode?: string;
  directorWord1?: string;
  directorWord2?: string;
  designation1?: string;
  designation2?: string;
  complementDesignation?: string;
  packaging?: string;
  packagingType?: string;
  submissionFgaz?: string;
  fgazFile?: string;
  label?: string;
  unity?: string;
  familyCode?: string;
  ecoContributionPercentage?: number;
  ecoContributionApplication?: boolean;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  quantity: number;
  brandId: number;
  categoryId: number;
  isActive: boolean;
  isFeatured?: boolean;
  tags?: string[];
  priceHt: number;
  priceTtc: number;
  imagesUrl?: string[];
  itemCode: string;
  directorWord1?: string;
  directorWord2?: string;
  designation1?: string;
  designation2?: string;
  complementDesignation?: string;
  packaging?: string;
  packagingType?: string;
  submissionFgaz?: string;
  fgazFile?: string;
  label?: string;
  unity?: string;
  weight?: number;
  familyCode?: string;
  ecoContributionPercentage?: number;
  ecoContributionApplication?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ProductMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} 