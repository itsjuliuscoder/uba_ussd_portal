import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import {
  DashboardStats,
  TransactionSummary,
  UserGrowth,
  RevenueData,
  UssdSessionStats,
} from "@/types/dashboard";

export const dashboardApi = {
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats",
      { params }
    );
    return response.data;
  },

  getTransactionsSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "type" | "status" | "wallet";
  }) => {
    const response = await apiClient.get<
      ApiResponse<{ summary: TransactionSummary[] }>
    >("/dashboard/transactions-summary", { params });
    return response.data;
  },

  getUserGrowth: async (params?: { period?: string; days?: number }) => {
    const response = await apiClient.get<ApiResponse<{ growth: UserGrowth[] }>>(
      "/dashboard/user-growth",
      { params }
    );
    return response.data;
  },

  getRevenue: async (params?: { period?: string; days?: number }) => {
    const response = await apiClient.get<
      ApiResponse<{ revenue: RevenueData[] }>
    >("/dashboard/revenue", { params });
    return response.data;
  },

  getUssdSessions: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<UssdSessionStats>>(
      "/dashboard/ussd-sessions",
      { params }
    );
    return response.data;
  },
};
