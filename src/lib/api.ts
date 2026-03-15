import axios from "axios";
import type { ScanHistoryResponse, StatisticsResponse, ThreatAnalysisResult } from "@/types/threat";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const analyzeUrl = async (url: string) => {
  const { data } = await apiClient.post<ApiResponse<ThreatAnalysisResult>>(
    "/api/v1/threats/analyze-url",
    { url }
  );
  return data;
};

export const analyzeFile = async (payload: {
  fileName: string;
  fileContent: string;
  fileType?: string;
}) => {
  const { data } = await apiClient.post<ApiResponse<ThreatAnalysisResult>>(
    "/api/v1/threats/analyze-file",
    payload
  );
  return data;
};

export const fetchStatistics = async () => {
  const { data } = await apiClient.get<ApiResponse<StatisticsResponse>>(
    "/api/v1/threats/statistics"
  );
  return data;
};

export const fetchHistory = async (params: {
  limit: number;
  skip: number;
  riskCategory?: string;
}) => {
  const { data } = await apiClient.get<ApiResponse<ScanHistoryResponse>>(
    "/api/v1/threats/history",
    { params }
  );
  return data;
};
