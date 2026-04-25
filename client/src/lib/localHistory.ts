import type { ScanHistoryDocument } from '@/types/threat';

const STORAGE_KEY = 'xscan_session_history_v1';

function readAll(): ScanHistoryDocument[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanHistoryDocument[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(items: ScanHistoryDocument[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function fetchLocalHistory(params?: { limit?: number; skip?: number }) {
  const all = readAll();
  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 50;
  const sliced = all.slice(skip, skip + limit);
  return Promise.resolve({
    scans: sliced,
    pagination: {
      total: all.length,
      limit,
      skip,
      hasMore: skip + limit < all.length,
    },
  });
}

export function clearLocalHistory() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    return Promise.resolve({ deletedCount: 0 });
  } catch {
    return Promise.reject(new Error('Failed to clear local history'));
  }
}

export function addLocalHistoryEntry(entry: Partial<ScanHistoryDocument>) {
  const all = readAll();
  const doc: ScanHistoryDocument = {
    _id: entry._id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
    url: entry.url ?? entry.fileName ?? null,
    fileName: entry.fileName ?? null,
    fileType: entry.fileType ?? null,
    threatScore: entry.threatScore ?? (entry as any).threatScore ?? 0,
    riskCategory: entry.riskCategory ?? 'LOW',
    recommendation: entry.recommendation ?? '',
    aiAnalysis: entry.aiAnalysis ?? '',
    riskFactors: entry.riskFactors ?? [],
    securityFeatures: entry.securityFeatures ?? [],
    detectionMethods: entry.detectionMethods ?? [],
    technicalDetails: entry.technicalDetails ?? {},
    processingTime: entry.processingTime ?? '',
    createdAt: entry.createdAt ?? new Date().toISOString(),
  } as ScanHistoryDocument;

  all.unshift(doc);
  writeAll(all);
  return Promise.resolve(doc);
}

export default {
  fetchLocalHistory,
  clearLocalHistory,
  addLocalHistoryEntry,
};
