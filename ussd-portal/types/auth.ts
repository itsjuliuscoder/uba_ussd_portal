export interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
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
