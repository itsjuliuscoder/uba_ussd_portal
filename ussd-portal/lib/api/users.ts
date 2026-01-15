

import apiClient from "./client";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { User, UserListParams, ResetPinParams } from "@/types/user";
import { Transaction } from "@/types/transaction";
import { UssdSession } from "@/types/session";
import { getMockMode } from "../mocks/config";
import { getMockUsers } from "../mocks/users";

export const usersApi = {

  list: async (params?: UserListParams) => {
    if (getMockMode() !== 'off') {
      const users = getMockUsers();
      return {
        success: true,
        data: {
          data: users,
          pagination: {
            total: users.length,
            page: 1,
            limit: users.length,
            totalPages: 1,
          },
        },
        message: 'Mock user list',
      };
    }
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      "/users",
      { params }
    );
    return response.data;
  },

  getById: async (id: number) => {
    if (getMockMode() !== 'off') {
      const user = getMockUsers().find(u => u.id === id);
      return {
        success: !!user,
        data: { user },
        message: user ? 'Mock user found' : 'Mock user not found',
      };
    }
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      `/users/${id}`
    );
    return response.data;
  },




  getByWalletId: async (walletId: string) => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      `/users/${walletId}/details`
    );
    return response.data;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  updateStatus: async (id: number, accountStatus: string) => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      `/users/${id}/status`,
      { accountStatus }
    );
    return response.data;
  },

  enable: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      `/users/${id}/enable`
    );
    return response.data;
  },

  disable: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(
      `/users/${id}/disable`
    );
    return response.data;
  },

  resetPin: async (id: number, params: ResetPinParams) => {
    const response = await apiClient.post<
      ApiResponse<{ userId: number; walletId: string; temporaryPin?: string }>
    >(`/users/${id}/reset-pin`, params);
    return response.data;
  },

  getTransactions: async (
    id: number,
    params?: { page?: number; limit?: number }
  ) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Transaction>>
    >(`/users/${id}/transactions`, { params });
    return response.data;
  },

  getSessions: async (
    id: number,
    params?: { page?: number; limit?: number }
  ) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<UssdSession>>
    >(`/users/${id}/ussd-sessions`, { params });
    return response.data;
  },
};
