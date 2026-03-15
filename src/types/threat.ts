export type RiskCategory = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DetectionMethod {
  name: string;
  result: "PASS" | "FAIL" | "WARNING";
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
  whois?: Record<string, unknown>;
  redirect?: Record<string, unknown>;
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
  technicalDetails?: TechnicalDetails;
  explainability?: {
    numericRiskScore?: number;
    triggeredIndicators?: string[];
    suspiciousFeatures?: string[];
    featureContributions?: Array<Record<string, unknown>> | null;
  };
  whois?: Record<string, unknown> | null;
  redirect?: Record<string, unknown> | null;
  virusTotalScanId?: string;
}

export interface ScanHistoryItem {
  _id: string;
  url?: string;
  fileName?: string;
  fileType?: string;
  threatScore: number;
  riskCategory: RiskCategory;
  recommendation: string;
  aiAnalysis: string;
  riskFactors: string[];
  securityFeatures: string[];
  detectionMethods: DetectionMethod[];
  technicalDetails?: TechnicalDetails;
  processingTime: string;
  createdAt: string;
  updatedAt: string;
  virusTotalScanId?: string;
}

export interface ScanHistoryResponse {
  scans: ScanHistoryItem[];
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
  threatDistribution: Record<RiskCategory, number>;
}
