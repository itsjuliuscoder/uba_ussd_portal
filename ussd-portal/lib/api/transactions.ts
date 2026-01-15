
import apiClient from "./client";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import {
  Transaction,
  TransactionListParams,
  AirtimeDataTransaction,
  CardlessTransaction,
} from "@/types/transaction";
import { getMockMode } from "../mocks/config";
import { getMockTransactions } from "../mocks/transactions";

export const transactionsApi = {

  list: async (params?: TransactionListParams) => {
    if (getMockMode() !== 'off') {
      const transactions = getMockTransactions();
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = transactions.length;
      const totalPages = Math.ceil(total / limit);
      const pagedTransactions = transactions.slice((page - 1) * limit, page * limit);
      return {
        success: true,
        data: {
          data: pagedTransactions,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
        message: 'Mock transaction list',
      };
    }
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Transaction>>
    >("/transactions", { params });
    return response.data;
  },

  getById: async (id: number) => {
    if (getMockMode() !== 'off') {
      const transaction = getMockTransactions().find(t => t.id === id);
      return {
        success: !!transaction,
        data: { transaction },
        message: transaction ? 'Mock transaction found' : 'Mock transaction not found',
      };
    }
    const response = await apiClient.get<
      ApiResponse<{ transaction: Transaction }>
    >(`/transactions/${id}`);
    return response.data;
  },

  getSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
  }) => {
    const response = await apiClient.get<
      ApiResponse<{
        summary: {
          totalCount: string;
          totalAmount: string;
          averageAmount: string;
        };
        byStatus: Array<{ status: string; count: string }>;
        byType: Array<{ type: string; count: string }>;
      }>
    >("/transactions/summary", { params });
    return response.data;
  },

  export: async (params: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    format?: string;
  }) => {
    const response = await apiClient.post("/transactions/export", params, {
      responseType: "blob",
    });
    return response.data;
  },

  listAirtimeData: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<AirtimeDataTransaction>>
    >("/transactions/airtime-data", { params });
    return response.data;
  },

  listCardless: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<CardlessTransaction>>
    >("/transactions/cardless", { params });
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: { status?: string; statusCode?: string; statusMessage?: string }
  ) => {
    const response = await apiClient.patch<
      ApiResponse<{ transaction: Transaction }>
    >(`/transactions/${id}/status`, data);
    return response.data;
  },
};
