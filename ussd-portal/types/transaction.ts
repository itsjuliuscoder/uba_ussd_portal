export interface Transaction {
  id: number;
  walletId: string;
  sender?: string;
  receiver?: string;
  sessionId?: string;
  transactionId?: string;
  amount: string;
  currency: string;
  status: string;
  statusCode?: string;
  statusMessage?: string;
  type: string;
  operator: string;
  CBAReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AirtimeDataTransaction {
  id: number;
  sessionId?: string;
  transactionId?: string;
  walletId: string;
  accountNo?: string;
  amount: string;
  country?: string;
  status: string;
  type: string;
  statusCode?: string;
  statusMessage?: string;
  createdAt?: string;
}

export interface CardlessTransaction {
  id: number;
  sessionId?: string;
  transactionId?: string;
  walletId: string;
  accountNo?: string;
  amount: string;
  country?: string;
  payCode?: string;
  callbackUrl?: string;
  currency: string;
  status: string;
  type: string;
  statusCode?: string;
  statusMessage?: string;
  createdAt?: string;
}
