

import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import {
  DashboardStats,
  TransactionSummary,
  UserGrowth,
  RevenueData,
  UssdSessionStats,
} from "@/types/dashboard";
import { getMockMode } from "../mocks/config";
import { getDashboardStats } from "../mocks/dashboardStats";
import { getMockRevenue, getMockUserGrowth } from "../mocks/dashboardAnalytics";

export const dashboardApi = {
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    if (getMockMode() !== 'off') {
      // Map mock stats to expected DashboardStats structure
      const stats = getDashboardStats();
      return {
        success: true,
        data: {
          users: {
            total: stats.totalUsers,
            active: stats.activeUsers,
            newToday: stats.newUsersToday,
          },
          transactions: {
            total: stats.totalTransactions,
            today: stats.transactionsToday,
            totalAmount: stats.revenue,
            successful: stats.transactionsToday, // For demo, use today's count
          },
          sessions: {
            total: stats.activeSessions + stats.activeSessionsToday,
            active: stats.activeSessions,
          },
        },
        message: 'Mock dashboard stats',
      };
    }
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
    if (getMockMode() !== 'off') {
      const growth = getMockUserGrowth(params?.period, params?.days ?? 30);
      return {
        success: true,
        data: { growth },
        message: 'Mock user growth',
      };
    }
    const response = await apiClient.get<ApiResponse<{ growth: UserGrowth[] }>>(
      "/dashboard/user-growth",
      { params }
    );
    return response.data;
  },


  getRevenue: async (params?: { period?: string; days?: number }) => {
    if (getMockMode() !== 'off') {
      const revenue = getMockRevenue(params?.period, params?.days ?? 30);
      return {
        success: true,
        data: { revenue },
        message: 'Mock revenue',
      };
    }
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
