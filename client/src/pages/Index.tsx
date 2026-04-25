import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HeroSection, { type BackendStatus, type MlStatus } from "@/components/HeroSection";
import AppHeader from "@/components/AppHeader";
import AnalyzeForm, { type AnalyzeMode, type AnalyzePayload } from "@/components/AnalyzeForm";
import ResultCard from "@/components/ResultCard";
import HistorySection from "@/components/HistorySection";
import StatsBar from "@/components/StatsBar";
import HowItWorksSection from "@/components/HowItWorksSection";
import { analyzeFile, analyzeUrl, ApiRequestError, fetchHealth, fetchStatistics } from "@/lib/api";
import { fetchLocalHistory, clearLocalHistory, addLocalHistoryEntry } from "@/lib/localHistory";
import { extractUrlFromInput } from "@/lib/urlUtils";
import type { ThreatAnalysisResult } from "@/types/threat";
import { toast } from "sonner";

type ScanStepStatus = "pending" | "active" | "complete";

interface ScanStep {
  id: string;
  label: string;
  status: ScanStepStatus;
}

const scanBlueprint: Record<AnalyzeMode, Array<{ id: string; label: string; threshold: number }>> = {
  url: [
    { id: "normalize", label: "Normalize and validate URL", threshold: 8 },
    { id: "intel", label: "Threat-intelligence lookups", threshold: 35 },
    { id: "heuristics", label: "Heuristic and redirect checks", threshold: 62 },
    { id: "ml", label: "ML scoring and confidence analysis", threshold: 84 },
    { id: "result", label: "Compiling final decision", threshold: 100 },
  ],
  file: [
    { id: "parse", label: "Parse filename and file content", threshold: 10 },
    { id: "extract", label: "Extract suspicious tokens and patterns", threshold: 38 },
    { id: "heuristics", label: "HTML/form/script heuristic checks", threshold: 65 },
    { id: "ml", label: "ML content risk scoring", threshold: 86 },
    { id: "result", label: "Compiling final decision", threshold: 100 },
  ],
};

function toSteps(mode: AnalyzeMode, progress: number): ScanStep[] {
  const blueprint = scanBlueprint[mode];
  const activeIndex = blueprint.findIndex((step) => progress < step.threshold);
  const currentIndex = activeIndex === -1 ? blueprint.length - 1 : activeIndex;

  return blueprint.map((step, idx) => {
    if (progress >= 100 || idx < currentIndex) {
      return { id: step.id, label: step.label, status: "complete" };
    }
    if (idx === currentIndex) {
      return { id: step.id, label: step.label, status: "active" };
    }
    return { id: step.id, label: step.label, status: "pending" };
  });
}

function toStageLabel(mode: AnalyzeMode, progress: number): string {
  const blueprint = scanBlueprint[mode];
  const current = blueprint.find((step) => progress < step.threshold) ?? blueprint[blueprint.length - 1];
  return current.label;
}

const Index = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ThreatAnalysisResult | null>(null);
  const [lastMode, setLastMode] = useState<AnalyzeMode>("url");
  const [sourceLabel, setSourceLabel] = useState("");
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [mlStatus, setMlStatus] = useState<MlStatus>("checking");
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [scanMode, setScanMode] = useState<AnalyzeMode>("url");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState("Ready to scan");
  const scanTimerRef = useRef<number | null>(null);

  const scanSteps = useMemo(() => toSteps(scanMode, scanProgress), [scanMode, scanProgress]);

  const historyQuery = useQuery({
    queryKey: ["scanHistory"],
    queryFn: () => fetchLocalHistory({ limit: 30, skip: 0 }),
    retry: 1,
  });

  const statsQuery = useQuery({
    queryKey: ["threatStatistics"],
    queryFn: fetchStatistics,
    retry: 1,
  });

  const refreshHealth = useCallback(async () => {
    setBackendStatus("checking");
    setMlStatus("checking");
    try {
      const h = await fetchHealth();
      if (h.status === "ok" && h.database === "disconnected") {
        setBackendStatus("degraded");
      } else if (h.status === "ok") {
        setBackendStatus("ok");
      } else {
        setBackendStatus("degraded");
      }
      setMlStatus(h.mlService === "connected" ? "ok" : "offline");
    } catch {
      setBackendStatus("offline");
      setMlStatus("offline");
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
    const t = window.setInterval(() => void refreshHealth(), 60_000);
    return () => window.clearInterval(t);
  }, [refreshHealth]);

  useEffect(() => {
    const hasSeenToast = window.sessionStorage.getItem("scan-shortcut-toast");
    if (hasSeenToast) return;

    const timer = window.setTimeout(() => {
      toast("Want to jump straight to scanning?", {
        description: "Use this shortcut to move directly to the analyzer form.",
        action: {
          label: "Skip to scan",
          onClick: () => {
            document
              .getElementById("scan-form")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          },
        },
      });
      window.sessionStorage.setItem("scan-shortcut-toast", "1");
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAnalyze = async (payload: AnalyzePayload) => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    setScanMode(payload.mode);
    setScanProgress(8);
    setScanStage(toStageLabel(payload.mode, 8));
    setIsLoading(true);
    setResult(null);

    scanTimerRef.current = window.setInterval(() => {
      setScanProgress((prev) => {
        const next = Math.min(prev + Math.floor(Math.random() * 7 + 3), 92);
        setScanStage(toStageLabel(payload.mode, next));
        return next;
      });
    }, 420);

    try {
      let data: ThreatAnalysisResult;

      if (payload.mode === "url") {
        const raw = payload.url?.trim() ?? "";
        const url = extractUrlFromInput(raw);
        if (!url) {
          toast.error("Could not find a valid http(s) URL. Paste a full URL or text containing one.");
          if (scanTimerRef.current) {
            window.clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
          }
          setScanProgress(0);
          setScanStage("Ready to scan");
          setIsLoading(false);
          return;
        }
        setLastMode("url");
        setSourceLabel(url);
        data = await analyzeUrl(url);
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
        data = await analyzeFile(
          payload.fileName ?? "pasted-content.txt",
          content,
          payload.fileType
        );
        setResult(data);
        toast.success("File analysis complete");
      }
      // Persist to session-local history so each browser only sees its own scans
      try {
        await addLocalHistoryEntry({
          url: payload.mode === 'url' ? (payload.url ?? '') : undefined,
          fileName: payload.mode === 'file' ? payload.fileName : undefined,
          threatScore: data.threatScore,
          riskCategory: data.riskCategory,
          recommendation: data.recommendation,
          aiAnalysis: data.aiAnalysis,
          riskFactors: data.riskFactors,
          securityFeatures: data.securityFeatures,
          detectionMethods: data.detectionMethods,
          technicalDetails: data.technicalDetails,
          processingTime: data.processingTime,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // ignore session storage errors
      }
      await queryClient.invalidateQueries({ queryKey: ["scanHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["threatStatistics"] });
      setScanProgress(100);
      setScanStage("Scan complete");
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Analysis failed";
      toast.error(msg);
      void refreshHealth();
      setScanStage("Scan failed");
    } finally {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
      setIsLoading(false);
      window.setTimeout(() => {
        setScanProgress(0);
        setScanStage("Ready to scan");
      }, 900);
    }
  };

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
      }
    };
  }, []);

  const confirmClearHistory = async () => {
    setIsClearingHistory(true);
    try {
      await clearLocalHistory();
      await queryClient.invalidateQueries({ queryKey: ["scanHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["threatStatistics"] });
      toast.success(`Scan history cleared`);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to clear history";
      toast.error(msg);
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleClearHistory = () => {
    if (isClearingHistory) return;
    toast("Clear all scan history?", {
      description: "This will permanently remove all saved scan records.",
      action: {
        label: "Yes, clear",
        onClick: () => {
          void confirmClearHistory();
        },
      },
      cancel: {
        label: "Cancel",
      },
    });
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
      <AppHeader />
      <HeroSection backendStatus={backendStatus} mlStatus={mlStatus} />
      <div className="space-y-8 pb-16">
        <StatsBar
          stats={statsQuery.data}
          isLoading={statsQuery.isLoading}
          error={statsError}
        />
        <div id="how-it-works" className="scroll-mt-20">
          <HowItWorksSection />
        </div>
        <div id="scan-form" className="scroll-mt-20">
          <AnalyzeForm
            onSubmit={handleAnalyze}
            isLoading={isLoading}
            scanProgress={scanProgress}
            scanStage={scanStage}
            scanSteps={scanSteps}
          />
        </div>
        {result && (
          <ResultCard result={result} mode={lastMode} sourceLabel={sourceLabel} />
        )}
        <div id="scan-history" className="scroll-mt-20">
          <HistorySection
            scans={historyQuery.data?.scans ?? []}
            isLoading={historyQuery.isFetching}
            isClearing={isClearingHistory}
            onRefresh={() => void historyQuery.refetch()}
            onClear={() => void handleClearHistory()}
            errorMessage={historyError}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
