export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  type: 'REGULAR';
  role: 'CLIENT' | 'ADMIN' | 'COMMERCIAL';
  companyName?: string;
  siretNumber?: string;
  urlPicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'CLIENT' | 'ADMIN' | 'COMMERCIAL';
  companyName?: string;
  siretNumber?: string;
  urlPicture?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: 'CLIENT' | 'ADMIN' | 'COMMERCIAL';
  companyName?: string;
  siretNumber?: string;
  urlPicture?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
}

export interface VerifyEmailParams {
  token: string;
}

export interface UsersResponse {
  users: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
  message: string;
}

export interface UserResponse {
  user: User;
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
} 