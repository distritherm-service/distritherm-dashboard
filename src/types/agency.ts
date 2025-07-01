export interface Agency {
  id: string;
  name: string;
  address?: string;
  country?: string;
  city?: string;
  postalCode?: string | number;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgencyInput {
  name: string;
  address?: string;
  country?: string;
  city?: string;
  postalCode?: string | number;
  phoneNumber?: string;
}

export interface UpdateAgencyInput extends Partial<CreateAgencyInput> {}

export interface AgencyMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} 