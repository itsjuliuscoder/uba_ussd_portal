
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
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = sessions.length;
      const totalPages = Math.ceil(total / limit);
      const pagedSessions = sessions.slice((page - 1) * limit, page * limit);
      const response = {
        success: true,
        data: {
          data: pagedSessions,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
        message: 'Mock session list',
      };
      console.log('[MOCK] sessionsApi.list response:', response);
      return response;
    }
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<UssdSession>>
    >("/ussd-sessions", { params });
    return response.data;
  },

  getById: async (sessionId: string) => {
    if (getMockMode() !== 'off') {
      const session = getMockSessions().find(s => s.sessionId === sessionId);
      return {
        success: !!session,
        data: { session },
        message: session ? 'Mock session found' : 'Mock session not found',
      };
    }
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
