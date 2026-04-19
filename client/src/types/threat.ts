/** Mirrors backend `backend/src/types/threatDetection.ts` for API responses */

export type RiskCategory = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DetectionMethodResult = "PASS" | "FAIL" | "WARNING";

export interface DetectionMethod {
  name: string;
  result: DetectionMethodResult;
  source?: string;
  details?: string;
}

export interface TechnicalDetails {
  domainAge?: string;
  sslStatus?: string;
  reputation?: string;
  suspiciousScripts?: string;
  hiddenIframes?: string;
  formSecurity?: string;
  ipLocation?: string;
  redirects?: string;
  responseTime?: string;
  whois?: unknown;
  redirect?: unknown;
}

export interface Explainability {
  numericRiskScore: number;
  triggeredIndicators: string[];
  suspiciousFeatures: string[];
  featureContributions?: Array<{ feature: string; importance: number }> | null;
}

export interface ThreatAnalysisResult {
  url?: string;
  fileName?: string;
  fileType?: string;
  threatScore: number;
  riskCategory: RiskCategory;
  recommendation: string;
  scanDate: string;
  processingTime: string;
  aiAnalysis: string;
  riskFactors: string[];
  securityFeatures: string[];
  detectionMethods: DetectionMethod[];
  technicalDetails: TechnicalDetails;
  virusTotalScanId?: string;
  explainability?: Explainability;
  whois?: unknown;
  redirect?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: string;
  message?: string;
}

export interface ScanHistoryDocument {
  _id: string;
  url?: string;
  fileName?: string;
  fileType?: string;
  threatScore: number;
  riskCategory: RiskCategory;
  recommendation: string;
  processingTime: string;
  createdAt: string;
  aiAnalysis?: string;
}

export interface HistoryResponse {
  scans: ScanHistoryDocument[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export interface StatisticsResponse {
  totalScans: number;
  recentScans: number;
  avgThreatScore: number;
  threatDistribution: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
  uptime?: number;
  database?: string;
  /** Present when backend supports ML status (Catchers AI backend). */
  mlService?: "connected" | "disconnected";
}
