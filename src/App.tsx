
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  analyzeFile,
  analyzeUrl,
  API_BASE_URL,
  fetchHistory,
  fetchStatistics,
} from "@/lib/api";
import type {
  RiskCategory,
  ScanHistoryItem,
  ScanHistoryResponse,
  StatisticsResponse,
  ThreatAnalysisResult,
} from "@/types/threat";

const riskPalette: Record<RiskCategory, string> = {
  LOW: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  HIGH: "bg-orange-500/15 text-orange-200 border-orange-500/30",
  CRITICAL: "bg-rose-500/15 text-rose-200 border-rose-500/30",
};

const riskGlow: Record<RiskCategory, string> = {
  LOW: "shadow-emerald-500/30",
  MEDIUM: "shadow-amber-500/30",
  HIGH: "shadow-orange-500/30",
  CRITICAL: "shadow-rose-500/30",
};

const distributionOrder: RiskCategory[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const ScoreMeter = ({ score }: { score: number }) => {
  const safeScore = Math.max(0, Math.min(100, score));
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-slate-400">Threat score</p>
          <p className="text-3xl font-semibold text-slate-50">{safeScore}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            0 - 100
          </p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
};

const RiskBadge = ({ risk }: { risk: RiskCategory }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
      riskPalette[risk]
    }`}
  >
    {risk}
  </span>
);

const SectionTitle = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="space-y-3">
    <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70 text-mono">
      {eyebrow}
    </p>
    <h2 className="text-3xl font-semibold text-slate-50 md:text-4xl">
      {title}
    </h2>
    <p className="max-w-2xl text-base text-slate-300">{description}</p>
  </div>
);

const ResultBadge = ({ status }: { status: "PASS" | "FAIL" | "WARNING" }) => {
  const classes =
    status === "PASS"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : status === "FAIL"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
      : "border-amber-500/40 bg-amber-500/10 text-amber-200";
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${classes}`}
    >
      {status}
    </span>
  );
};

export default function App() {
  const apiDocsUrl = `${API_BASE_URL.replace(/\/+$/, "")}/api-docs`;
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [analysis, setAnalysis] = useState<ThreatAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [history, setHistory] = useState<ScanHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historySkip, setHistorySkip] = useState(0);
  const [historyRisk, setHistoryRisk] = useState<"ALL" | RiskCategory>(
    "ALL"
  );

  const historyLimit = 8;

  const loadStatistics = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await fetchStatistics();
      if (response.success) {
        setStats(response.data);
      } else {
        setStatsError(response.error || "Unable to load statistics.");
      }
    } catch (error) {
      setStatsError("Unable to load statistics.");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadHistory = async (skip = historySkip, risk = historyRisk) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetchHistory({
        limit: historyLimit,
        skip,
        riskCategory: risk === "ALL" ? undefined : risk,
      });
      if (response.success) {
        setHistory(response.data);
      } else {
        setHistoryError(response.error || "Unable to load history.");
      }
    } catch (error) {
      setHistoryError("Unable to load history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
    loadHistory(0, historyRisk);
    setHistorySkip(0);
  }, [historyRisk]);

  const distributionData = useMemo(() => {
    if (!stats?.threatDistribution) return [];
    return distributionOrder.map((category) => ({
      category,
      value: stats.threatDistribution[category] || 0,
    }));
  }, [stats]);

  const handleFileChange = (file: File | null) => {
    setFileInput(file);
    setFileContent("");
    setAnalysis(null);

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result ? String(reader.result) : "";
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      if (activeTab === "url") {
        if (!urlInput.trim()) {
          setAnalysisError("Enter a URL to analyze.");
          setAnalysisLoading(false);
          return;
        }

        const response = await analyzeUrl(urlInput.trim());
        if (response.success) {
          setAnalysis(response.data);
        } else {
          setAnalysisError(response.error || "Scan failed.");
        }
      } else {
        if (!fileInput || !fileContent) {
          setAnalysisError("Select a file to analyze.");
          setAnalysisLoading(false);
          return;
        }

        const response = await analyzeFile({
          fileName: fileInput.name,
          fileContent,
          fileType: fileInput.type,
        });
        if (response.success) {
          setAnalysis(response.data);
        } else {
          setAnalysisError(response.error || "Scan failed.");
        }
      }

      loadStatistics();
      loadHistory(0, historyRisk);
      setHistorySkip(0);
    } catch (error: any) {
      setAnalysisError(error?.message || "Scan failed.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const activeHistory = history?.scans ?? [];
  const technicalEntries = useMemo(() => {
    if (!analysis?.technicalDetails) return [];
    return Object.entries(analysis.technicalDetails).filter(
      ([, value]) => value == null || typeof value !== "object"
    );
  }, [analysis]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-glow" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <header className="relative z-10 border-b border-slate-800/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-200">
                <span className="text-lg font-semibold">NW</span>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70 text-mono">
                  NetWard AI
                </p>
                <p className="text-base font-semibold">Threat Command Center</p>
              </div>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <a href="#scan" className="hover:text-white">
                Live Scan
              </a>
              <a href="#insights" className="hover:text-white">
                Intelligence
              </a>
              <a href="#history" className="hover:text-white">
                History
              </a>
              <a
                href={apiDocsUrl}
                className="hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                API Docs
              </a>
            </nav>
          </div>
        </header>

        <main className="relative z-10">
          <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 md:flex-row md:items-center">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
                AI-powered phishing and threat detection
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-50 md:text-5xl">
                Detect malicious links, files, and suspicious content before it
                spreads.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                NetWard AI fuses threat intelligence, machine learning, and
                heuristic analysis into a single command surface. Run
                on-demand scans, monitor historical risk, and brief your team
                with confidence.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400"
                  onClick={() =>
                    document.getElementById("scan")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  Launch live scan
                </button>
                <button
                  className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
                  onClick={() =>
                    document.getElementById("insights")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  View intelligence
                </button>
              </div>
            </div>
            <div className="flex-1">
              <div className="glass rounded-3xl p-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400 text-mono">
                      System overview
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-50">
                      Active defense status
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        ML model
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-100">
                        Adaptive
                      </p>
                      <p className="text-xs text-slate-400">
                        Feature-level explainability
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Threat intel
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-100">
                        Multi-source
                      </p>
                      <p className="text-xs text-slate-400">
                        VirusTotal, GSB, PhishTank
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Response time
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-100">
                        &lt; 2s
                      </p>
                      <p className="text-xs text-slate-400">
                        Cached for rapid rechecks
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Coverage
                      </p>
                      <p className="mt-3 text-xl font-semibold text-slate-100">
                        URL + File
                      </p>
                      <p className="text-xs text-slate-400">
                        Content + redirects + WHOIS
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="scan" className="mx-auto max-w-6xl px-6 pb-20">
            <div className="glass rounded-3xl p-8">
              <div className="flex flex-col gap-10 md:flex-row md:items-start">
                <div className="flex-1 space-y-8">
                  <SectionTitle
                    eyebrow="Live Scan"
                    title="Analyze links and files in real time"
                    description="Submit URLs or file content for immediate analysis. NetWard AI blends machine learning, threat intelligence, and heuristic signals into a unified report."
                  />
                  <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 p-1 text-sm">
                    <button
                      className={`flex-1 rounded-full px-4 py-2 transition ${
                        activeTab === "url"
                          ? "bg-cyan-500 text-slate-900"
                          : "text-slate-300"
                      }`}
                      onClick={() => setActiveTab("url")}
                    >
                      URL scan
                    </button>
                    <button
                      className={`flex-1 rounded-full px-4 py-2 transition ${
                        activeTab === "file"
                          ? "bg-cyan-500 text-slate-900"
                          : "text-slate-300"
                      }`}
                      onClick={() => setActiveTab("file")}
                    >
                      File scan
                    </button>
                  </div>

                  {activeTab === "url" ? (
                    <div className="space-y-4">
                      <label className="text-sm text-slate-300">
                        Target URL
                      </label>
                      <input
                        value={urlInput}
                        onChange={(event) => setUrlInput(event.target.value)}
                        placeholder="https://example.com"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                      />
                      <p className="text-xs text-slate-500">
                        Supports full URLs including HTTPS, query strings, and
                        subdomains.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-sm text-slate-300">
                        Upload file
                      </label>
                      <input
                        type="file"
                        onChange={(event) =>
                          handleFileChange(event.target.files?.[0] || null)
                        }
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-cyan-100"
                      />
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
                        {fileInput
                          ? `${fileInput.name} - ${(fileInput.size / 1024).toFixed(1)} KB`
                          : "No file selected. Max file size 10MB."}
                      </div>
                    </div>
                  )}

                  {analysisError && (
                    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {analysisError}
                    </div>
                  )}

                  <button
                    className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleAnalyze}
                    disabled={analysisLoading}
                  >
                    {analysisLoading ? "Analyzing..." : "Run analysis"}
                  </button>
                </div>

                <div className="flex-1">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400 text-mono">
                          Result snapshot
                        </p>
                        {analysis?.riskCategory && (
                          <RiskBadge risk={analysis.riskCategory} />
                        )}
                      </div>
                      {analysis ? (
                        <div className="space-y-6">
                          <ScoreMeter score={analysis.threatScore} />
                          <div className="space-y-2">
                            <p className="text-sm text-slate-400">
                              Recommendation
                            </p>
                            <p className="text-base text-slate-100">
                              {analysis.recommendation}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                            {analysis.aiAnalysis}
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              Scanned {formatDateTime(analysis.scanDate)}
                            </span>
                            <span>Processing {analysis.processingTime}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-sm text-slate-500">
                          Run a scan to populate this report. Analysis results
                          include risk scoring, explainability, and technical
                          signals.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {analysis && (
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Risk factors
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      {analysis.riskFactors.length > 0 ? (
                        analysis.riskFactors.map((factor) => (
                          <div
                            key={factor}
                            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                          >
                            {factor}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">No risk factors found.</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Security signals
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      {analysis.securityFeatures.length > 0 ? (
                        analysis.securityFeatures.map((feature) => (
                          <div
                            key={feature}
                            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                          >
                            {feature}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">No security signals.</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Detection methods
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      {analysis.detectionMethods.map((method) => (
                        <div
                          key={`${method.name}-${method.result}`}
                          className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-100">
                              {method.name}
                            </p>
                            <ResultBadge status={method.result} />
                          </div>
                          {method.details && (
                            <p className="mt-2 text-xs text-slate-400">
                              {method.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          <section id="insights" className="mx-auto max-w-6xl px-6 pb-20">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              <div className="glass rounded-3xl p-8">
                <SectionTitle
                  eyebrow="Intelligence"
                  title="Real-time threat statistics"
                  description="Track the system-wide scan volume, risk distribution, and average threat score. These metrics update instantly as new scans land."
                />
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {statsLoading ? (
                    <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
                      Loading statistics...
                    </div>
                  ) : statsError ? (
                    <div className="col-span-full rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
                      {statsError}
                    </div>
                  ) : (
                    [
                      {
                        label: "Total scans",
                        value: stats?.totalScans ?? 0,
                      },
                      {
                        label: "Scans in 24h",
                        value: stats?.recentScans ?? 0,
                      },
                      {
                        label: "Avg threat score",
                        value: stats?.avgThreatScore
                          ? stats.avgThreatScore.toFixed(1)
                          : "0.0",
                      },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {card.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold text-slate-100">
                          {card.value}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass rounded-3xl p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400 text-mono">
                      Distribution
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-100">
                      Risk category spread
                    </h3>
                  </div>
                  <button
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                    onClick={() => {
                      loadStatistics();
                      loadHistory(historySkip, historyRisk);
                    }}
                  >
                    Refresh
                  </button>
                </div>
                <div className="mt-8 h-64">
                  {statsLoading ? (
                    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
                      Loading chart...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionData}>
                        <XAxis
                          dataKey="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148,163,184,0.1)" }}
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(148,163,184,0.2)",
                            borderRadius: 12,
                            color: "#f8fafc",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[16, 16, 0, 0]}
                          fill="#22d3ee"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {analysis && (
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Technical details
                  </h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300">
                    {technicalEntries.length > 0 ? (
                      technicalEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                        >
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {key}
                          </span>
                          <span className="text-right text-sm text-slate-100">
                            {value ? String(value) : "N/A"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No technical details.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Explainability
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    {analysis.explainability?.triggeredIndicators?.length ? (
                      analysis.explainability.triggeredIndicators.map(
                        (indicator) => (
                          <div
                            key={indicator}
                            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                          >
                            {indicator}
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-slate-500">
                        Explainability signals will appear here when ML
                        features are available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section id="history" className="mx-auto max-w-6xl px-6 pb-24">
            <div className="glass rounded-3xl p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <SectionTitle
                  eyebrow="History"
                  title="Recent scan archive"
                  description="Review past scans, filter by risk level, and export findings for investigations."
                />
                <div className="flex items-center gap-3">
                  <select
                    value={historyRisk}
                    onChange={(event) =>
                      setHistoryRisk(event.target.value as "ALL" | RiskCategory)
                    }
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs text-slate-100"
                  >
                    <option value="ALL">All risk levels</option>
                    {distributionOrder.map((risk) => (
                      <option key={risk} value={risk}>
                        {risk}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300"
                    onClick={() => loadHistory(historySkip, historyRisk)}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {historyLoading ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
                    Loading history...
                  </div>
                ) : historyError ? (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
                    {historyError}
                  </div>
                ) : activeHistory.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
                    No scans yet. Run a scan to start building history.
                  </div>
                ) : (
                  activeHistory.map((scan: ScanHistoryItem) => (
                    <div
                      key={scan._id}
                      className={`rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl ${
                        riskGlow[scan.riskCategory]
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <RiskBadge risk={scan.riskCategory} />
                            <span className="text-xs text-slate-400">
                              {formatDateTime(scan.createdAt)}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-slate-100">
                            {scan.url || scan.fileName || "Unknown target"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {scan.recommendation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Threat score
                          </p>
                          <p className="text-2xl font-semibold text-slate-100">
                            {scan.threatScore}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                        {scan.riskFactors.slice(0, 4).map((risk) => (
                          <div
                            key={risk}
                            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                          >
                            {risk}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
                <span>
                  Showing {activeHistory.length} of {history?.pagination.total ?? 0}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300 disabled:opacity-50"
                    onClick={() => {
                      const next = Math.max(0, historySkip - historyLimit);
                      setHistorySkip(next);
                      loadHistory(next, historyRisk);
                    }}
                    disabled={historySkip === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300 disabled:opacity-50"
                    onClick={() => {
                      const next = historySkip + historyLimit;
                      if (history?.pagination.hasMore) {
                        setHistorySkip(next);
                        loadHistory(next, historyRisk);
                      }
                    }}
                    disabled={!history?.pagination.hasMore}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
