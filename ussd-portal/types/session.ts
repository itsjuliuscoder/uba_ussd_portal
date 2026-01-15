export interface UssdSession {
  id: number;
  walletId: string;
  sessionId: string;
  questionType: string;
  wallet: string;
  closeState?: string;
  items?: string;
  steps?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionListParams {
  page?: number;
  limit?: number;
  walletId?: string;
  wallet?: string;
  language?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface SessionAnalytics {
  total: number;
  closed: number;
  open: number;
  uniqueUsers: number;
  byWallet: Array<{ wallet: string; count: string }>;
  byLanguage: Array<{ language: string; count: string }>;
  byQuestionType: Array<{ questionType: string; count: string }>;
}
