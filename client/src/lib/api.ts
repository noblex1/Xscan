import type {
  ApiErrorBody,
  ApiSuccess,
  HealthResponse,
  HistoryResponse,
  StatisticsResponse,
  ThreatAnalysisResult,
} from "@/types/threat";

export class ApiRequestError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

function getApiOrigin(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (typeof env === "string" && env.trim()) {
    return env.replace(/\/$/, "");
  }
  return "";
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const origin = getApiOrigin();
  if (!origin && import.meta.env.PROD) {
    throw new ApiRequestError(
      "Missing VITE_API_BASE_URL in production frontend environment",
      0,
      null
    );
  }
  const url = `${origin}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await parseJsonSafe(res)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (!res.ok) {
    const err = payload as ApiErrorBody | null;
    const message =
      err?.error ?? err?.message ?? `Request failed (${res.status})`;
    throw new ApiRequestError(message, res.status, err);
  }

  if (!payload || typeof payload !== "object" || !("success" in payload)) {
    throw new ApiRequestError("Invalid response shape", res.status, null);
  }

  if (!payload.success) {
    const err = payload as ApiErrorBody;
    throw new ApiRequestError(err.error ?? "Request failed", res.status, err);
  }

  return (payload as ApiSuccess<T>).data;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const origin = getApiOrigin();
  if (!origin && import.meta.env.PROD) {
    throw new ApiRequestError(
      "Missing VITE_API_BASE_URL in production frontend environment",
      0,
      null
    );
  }
  const res = await fetch(`${origin}/health`);
  if (!res.ok) {
    throw new ApiRequestError("Health check failed", res.status, null);
  }
  return res.json() as Promise<HealthResponse>;
}

export async function analyzeUrl(url: string): Promise<ThreatAnalysisResult> {
  return requestJson<ThreatAnalysisResult>("/api/v1/threats/analyze-url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function analyzeFile(
  fileName: string,
  fileContent: string,
  fileType?: string
): Promise<ThreatAnalysisResult> {
  const body: { fileName: string; fileContent: string; fileType?: string } = {
    fileName,
    fileContent,
  };
  if (fileType) body.fileType = fileType;
  return requestJson<ThreatAnalysisResult>("/api/v1/threats/analyze-file", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchScanHistory(params?: {
  limit?: number;
  skip?: number;
  riskCategory?: string;
}): Promise<HistoryResponse> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.skip != null) q.set("skip", String(params.skip));
  if (params?.riskCategory) q.set("riskCategory", params.riskCategory);
  const qs = q.toString();
  const path = `/api/v1/threats/history${qs ? `?${qs}` : ""}`;
  return requestJson<HistoryResponse>(path);
}

export async function fetchStatistics(): Promise<StatisticsResponse> {
  return requestJson<StatisticsResponse>("/api/v1/threats/statistics");
}

export async function clearScanHistory(): Promise<{ deletedCount: number }> {
  return requestJson<{ deletedCount: number }>("/api/v1/threats/history", {
    method: "DELETE",
  });
}
