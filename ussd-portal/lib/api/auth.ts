
import apiClient from "./client";
import { ApiResponse } from "@/types/api";
import { LoginCredentials, LoginResponse, Admin } from "@/types/auth";
import { getMockMode } from "../mocks/config";
import { mockLogin, mockLogout, mockIsAuthenticated } from "../mocks/auth";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    if (getMockMode() !== 'off') {
      // Try both username and email for compatibility
      const result = await mockLogin(credentials.username, credentials.password);
      if (result) {
        return { success: true, data: result, message: 'Mock login success' };
      }
      return { success: false, data: null, message: 'Mock login failed' };
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/admin/login",
      credentials
    );
    return response.data;
  },

  getMe: async () => {
    if (getMockMode() !== 'off') {
      // Return the static mock user for getMe
      return { success: true, data: { admin: await mockLogin('jane@example.com', 'password') }, message: 'Mock getMe' };
    }
    const response = await apiClient.get<ApiResponse<{ admin: Admin }>>(
      "/admin/me"
    );
    return response.data;
  },

  refreshToken: async () => {
    if (getMockMode() !== 'off') {
      return { success: true, data: { token: 'mock-token' }, message: 'Mock refreshToken' };
    }
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      "/admin/refresh-token"
    );
    return response.data;
  },

  logout: async () => {
    if (getMockMode() !== 'off') {
      await mockLogout();
      return { success: true, data: null, message: 'Mock logout' };
    }
    const response = await apiClient.post<ApiResponse<null>>("/admin/logout");
    return response.data;
  },
};
