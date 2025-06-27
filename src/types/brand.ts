export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  country?: string;
  isActive: boolean;
  productsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrandInput {
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  country?: string;
  isActive?: boolean;
}

export interface UpdateBrandInput extends Partial<CreateBrandInput> {}

export interface BrandMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} 