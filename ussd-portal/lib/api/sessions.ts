
import apiClient from "./client";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import {
  UssdSession,
  SessionListParams,
  SessionAnalytics,
} from "@/types/session";
import { getMockMode } from "../mocks/config";
import { getMockSessions } from "../mocks/sessions";

export const sessionsApi = {

  list: async (params?: SessionListParams) => {
    if (getMockMode() !== 'off') {
      const sessions = getMockSessions();
      return {
        success: true,
        data: {
          items: sessions,
          total: sessions.length,
          page: 1,
          pageSize: sessions.length,
        },
        message: 'Mock session list',
      };
    }
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<UssdSession>>
    >("/ussd-sessions", { params });
    return response.data;
  },

  getById: async (sessionId: string) => {
    const response = await apiClient.get<ApiResponse<{ session: UssdSession }>>(
      `/ussd-sessions/${sessionId}`
    );
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get<
      ApiResponse<{ sessions: UssdSession[]; count: number }>
    >("/ussd-sessions/active");
    return response.data;
  },

  getAnalytics: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get<ApiResponse<SessionAnalytics>>(
      "/ussd-sessions/analytics",
      { params }
    );
    return response.data;
  },
};
