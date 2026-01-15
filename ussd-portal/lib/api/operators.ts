import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import {
  Operator,
  CreateOperatorParams,
  UpdateOperatorParams,
} from "@/types/operator";

export const operatorsApi = {
  list: async (params?: {
    country?: string;
    status?: boolean;
    search?: string;
  }) => {
    const response = await apiClient.get<
      ApiResponse<{ operators: Operator[] }>
    >("/operators", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<{ operator: Operator }>>(
      `/operators/${id}`
    );
    return response.data;
  },

  create: async (data: CreateOperatorParams) => {
    const response = await apiClient.post<ApiResponse<{ operator: Operator }>>(
      "/operators",
      data
    );
    return response.data;
  },

  update: async (id: number, data: UpdateOperatorParams) => {
    const response = await apiClient.put<ApiResponse<{ operator: Operator }>>(
      `/operators/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/operators/${id}`
    );
    return response.data;
  },

  toggleStatus: async (id: number, status?: boolean) => {
    const response = await apiClient.patch<ApiResponse<{ operator: Operator }>>(
      `/operators/${id}/status`,
      status !== undefined ? { status } : {}
    );
    return response.data;
  },
};
