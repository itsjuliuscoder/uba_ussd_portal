export interface Admin {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}
