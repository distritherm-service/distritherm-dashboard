export interface Category {
  id: number;
  name: string;
  description?: string;
  alias?: string;
  imageUrl?: string;
  level?: number;
  haveParent?: boolean;
  haveChildren?: boolean;
  parentCategoryId?: number | null;
  agenceId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  imageUrl?: string;
  level: number;
  alias?: string;
  haveParent?: boolean;
  haveChildren?: boolean;
  description?: string;
  parentCategoryId?: number | null;
  agenceId: number;
  imageFile?: File;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  alias?: string;
  level?: number;
  imageFile?: File;
} 