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
}

export interface CreateProductInput {
  name: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  quantity: number;
  imageUrl?: string;
  brandId: number;
  categoryId: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  quantity?: number;
  imageUrl?: string;
  brandId?: number;
  categoryId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
} 