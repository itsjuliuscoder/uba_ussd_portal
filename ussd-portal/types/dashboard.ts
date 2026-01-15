export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
  };
  transactions: {
    total: number;
    successful: number;
    today: number;
    totalAmount: number;
  };
  sessions: {
    total: number;
    active: number;
  };
}

export interface TransactionSummary {
  type?: string;
  status?: string;
  operator?: string;
  count: string;
  totalAmount: string;
}

export interface UserGrowth {
  period: string;
  count: string;
}

export interface RevenueData {
  period: string;
  totalAmount: string;
  transactionCount: string;
}

export interface UssdSessionStats {
  total: number;
  active: number;
  byWallet: Array<{ wallet: string; count: string }>;
  byLanguage: Array<{ language: string; count: string }>;
}
