export interface User {
  id: number;
  walletId: string;
  alternatePhoneno?: string;
  accountNumber: string;
  fullName: string;
  country: string;
  wallet: string;
  type: string;
  pin: string;
  accountStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  wallet?: string;
  accountStatus?: string;
  country?: string;
}

export interface ResetPinParams {
  newPin?: string;
  generateRandom?: boolean;
}
