import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HeroSection, { type BackendStatus } from "@/components/HeroSection";
import AnalyzeForm, { type AnalyzeMode, type AnalyzePayload } from "@/components/AnalyzeForm";
import ResultCard from "@/components/ResultCard";
import HistorySection from "@/components/HistorySection";
import StatsBar from "@/components/StatsBar";
import {
  analyzeFile,
  analyzeUrl,
  ApiRequestError,
  fetchHealth,
  fetchScanHistory,
  fetchStatistics,
} from "@/lib/api";
import { extractUrlFromInput } from "@/lib/urlUtils";
import type { ThreatAnalysisResult } from "@/types/threat";
import { toast } from "sonner";

const Index = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ThreatAnalysisResult | null>(null);
  const [lastMode, setLastMode] = useState<AnalyzeMode>("url");
  const [sourceLabel, setSourceLabel] = useState("");
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");

  const historyQuery = useQuery({
    queryKey: ["scanHistory"],
    queryFn: () => fetchScanHistory({ limit: 30, skip: 0 }),
    retry: 1,
  });

  const statsQuery = useQuery({
    queryKey: ["threatStatistics"],
    queryFn: fetchStatistics,
    retry: 1,
  });

  const refreshHealth = useCallback(async () => {
    setBackendStatus("checking");
    try {
      const h = await fetchHealth();
      if (h.status === "ok" && h.database === "disconnected") {
        setBackendStatus("degraded");
      } else if (h.status === "ok") {
        setBackendStatus("ok");
      } else {
        setBackendStatus("degraded");
      }
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
    const t = window.setInterval(() => void refreshHealth(), 60_000);
    return () => window.clearInterval(t);
  }, [refreshHealth]);

  const handleAnalyze = async (payload: AnalyzePayload) => {
    setIsLoading(true);
    setResult(null);
    try {
      if (payload.mode === "url") {
        const raw = payload.url?.trim() ?? "";
        const url = extractUrlFromInput(raw);
        if (!url) {
          toast.error("Could not find a valid http(s) URL. Paste a full URL or text containing one.");
          setIsLoading(false);
          return;
        }
        setLastMode("url");
        setSourceLabel(url);
        const data = await analyzeUrl(url);
        setResult(data);
        toast.success("URL analysis complete");
      } else {
        const content = payload.fileContent?.trim() ?? "";
        if (!content) {
          setIsLoading(false);
          return;
        }
        setLastMode("file");
        setSourceLabel(payload.fileName ?? "file");
        const data = await analyzeFile(
          payload.fileName ?? "pasted-content.txt",
          content,
          payload.fileType
        );
        setResult(data);
        toast.success("File analysis complete");
      }
      await queryClient.invalidateQueries({ queryKey: ["scanHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["threatStatistics"] });
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Analysis failed";
      toast.error(msg);
      void refreshHealth();
    } finally {
      setIsLoading(false);
    }
  };

  const historyError =
    historyQuery.isError
      ? historyQuery.error instanceof Error
        ? historyQuery.error.message
        : "Failed to load history"
      : null;

  const statsError =
    statsQuery.isError
      ? statsQuery.error instanceof Error
        ? statsQuery.error.message
        : "Failed to load statistics"
      : null;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection backendStatus={backendStatus} />
      <div className="space-y-8 pb-16">
        <StatsBar
          stats={statsQuery.data}
          isLoading={statsQuery.isLoading}
          error={statsError}
        />
        <AnalyzeForm onSubmit={handleAnalyze} isLoading={isLoading} />
        {result && (
          <ResultCard result={result} mode={lastMode} sourceLabel={sourceLabel} />
        )}
        <HistorySection
          scans={historyQuery.data?.scans ?? []}
          isLoading={historyQuery.isFetching}
          onRefresh={() => void historyQuery.refetch()}
          errorMessage={historyError}
        />
      </div>
    </div>
  );
};

export default Index;
