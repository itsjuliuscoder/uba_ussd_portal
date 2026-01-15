import apiClient from "./client";
import { ApiResponse } from "@/types/api";

export const configApi = {
  get: async () => {
    const response = await apiClient.get<ApiResponse<{ config: any }>>(
      "/config"
    );
    return response.data;
  },

  update: async (config: any) => {
    const response = await apiClient.put<ApiResponse<{ config: any }>>(
      "/config",
      { config }
    );
    return response.data;
  },

  getMenuText: async () => {
    const response = await apiClient.get<ApiResponse<{ menuText: any }>>(
      "/config/menu-text"
    );
    return response.data;
  },

  updateMenuText: async (language: string, menuText: any) => {
    const response = await apiClient.put<
      ApiResponse<{ language: string; menuText: any }>
    >("/config/menu-text", { language, menuText });
    return response.data;
  },
};
