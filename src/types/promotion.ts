export interface Promotion {
  id: number;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromotionInput {
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
} 