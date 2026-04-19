import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Copy,
  Cpu,
  Microscope,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import type { RiskCategory, ThreatAnalysisResult } from "@/types/threat";
import type { AnalyzeMode } from "@/components/AnalyzeForm";

type VisualRisk = "low" | "medium" | "high";

function categoryToVisual(cat: RiskCategory): VisualRisk {
  if (cat === "LOW") return "low";
  if (cat === "MEDIUM") return "medium";
  return "high";
}

const styles: Record<
  VisualRisk,
  {
    icon: typeof ShieldCheck;
    label: string;
    color: string;
    bg: string;
    glow: string;
    badgeClass: string;
    bar: string;
  }
> = {
  low: {
    icon: ShieldCheck,
    label: "Low risk",
    color: "text-safe",
    bg: "bg-safe/10 border-safe/30",
    glow: "glow-safe",
    badgeClass: "bg-safe/20 text-safe border-safe/30",
    bar: "bg-safe",
  },
  medium: {
    icon: ShieldAlert,
    label: "Elevated risk",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
    glow: "glow-warning",
    badgeClass: "bg-warning/20 text-warning border-warning/30",
    bar: "bg-warning",
  },
  high: {
    icon: ShieldX,
    label: "High / critical risk",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    glow: "glow-destructive",
    badgeClass: "bg-destructive/20 text-destructive border-destructive/30",
    bar: "bg-destructive",
  },
};

function resultLabel(cat: RiskCategory): string {
  switch (cat) {
    case "LOW":
      return "LOW";
    case "MEDIUM":
      return "MEDIUM";
    case "HIGH":
      return "HIGH";
    case "CRITICAL":
      return "CRITICAL";
    default:
      return cat;
  }
}

interface ResultCardProps {
  result: ThreatAnalysisResult;
  mode: AnalyzeMode;
  sourceLabel: string;
}

const ResultCard = ({ result, mode, sourceLabel }: ResultCardProps) => {
  const visual = categoryToVisual(result.riskCategory);
  const c = styles[visual];
  const Icon = c.icon;
  const score = Math.min(100, Math.max(0, result.threatScore));

  const copyResult = () => {
    const target = result.url ?? result.fileName ?? sourceLabel;
    const text = [
      `Catchers AI — ${resultLabel(result.riskCategory)}`,
      `Threat score: ${score}/100`,
      `Target: ${target}`,
      "",
      result.recommendation,
      "",
      result.aiAnalysis,
    ].join("\n");
    void navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard");
  };

  const methodBadge = (r: string) => {
    if (r === "PASS") return "bg-safe/15 text-safe border-safe/30";
    if (r === "FAIL") return "bg-destructive/15 text-destructive border-destructive/30";
    return "bg-warning/15 text-warning border-warning/30";
  };

  const td = result.technicalDetails ?? {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-2xl"
    >
      <div className={`rounded-xl border p-6 md:p-8 ${c.bg} ${c.glow}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Icon className={`w-8 h-8 shrink-0 ${c.color}`} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-xl font-heading font-bold ${c.color}`}>{c.label}</h3>
                <Badge variant="outline" className={`font-mono text-xs ${c.badgeClass}`}>
                  {resultLabel(result.riskCategory)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono truncate" title={sourceLabel}>
                {sourceLabel}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyResult}
            className="text-muted-foreground hover:text-foreground shrink-0"
            type="button"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Threat score
          </span>
          <span className={`text-2xl font-heading font-bold tabular-nums ${c.color}`}>
            {score}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted mb-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`h-full rounded-full ${c.bar}`}
          />
        </div>

        <p className="font-medium text-foreground text-sm mb-2">{result.recommendation}</p>
        <p className="text-foreground/80 text-sm mb-4 whitespace-pre-wrap">{result.aiAnalysis}</p>

        <Accordion type="multiple" className="w-full border-t border-border/50 pt-2">
          {(result.riskFactors?.length ?? 0) > 0 && (
            <AccordionItem value="risks" className="border-border/50">
              <AccordionTrigger className="text-sm font-heading hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Risk factors ({result.riskFactors.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {result.riskFactors.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {(result.securityFeatures?.length ?? 0) > 0 && (
            <AccordionItem value="positive" className="border-border/50">
              <AccordionTrigger className="text-sm font-heading hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-safe" />
                  Positive signals ({result.securityFeatures.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {result.securityFeatures.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {(result.detectionMethods?.length ?? 0) > 0 && (
            <AccordionItem value="methods" className="border-border/50">
              <AccordionTrigger className="text-sm font-heading hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  Detection methods
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                {result.detectionMethods.map((m, i) => (
                  <div
                    key={`${m.name}-${i}`}
                    className="rounded-lg border border-border/60 bg-card/50 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{m.name}</span>
                      <Badge variant="outline" className={`font-mono text-[10px] ${methodBadge(m.result)}`}>
                        {m.result}
                      </Badge>
                      {m.source && (
                        <span className="text-xs text-muted-foreground font-mono">{m.source}</span>
                      )}
                    </div>
                    {m.details && (
                      <p className="text-xs text-muted-foreground font-mono">{m.details}</p>
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {Object.keys(td).length > 0 && (
            <AccordionItem value="technical" className="border-border/50">
              <AccordionTrigger className="text-sm font-heading hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-accent" />
                  Technical details
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {td.sslStatus && (
                    <>
                      <dt className="text-muted-foreground">SSL/TLS</dt>
                      <dd>{td.sslStatus}</dd>
                    </>
                  )}
                  {td.domainAge && (
                    <>
                      <dt className="text-muted-foreground">Domain age</dt>
                      <dd>{td.domainAge}</dd>
                    </>
                  )}
                  {td.redirects && (
                    <>
                      <dt className="text-muted-foreground">Redirects</dt>
                      <dd>{td.redirects}</dd>
                    </>
                  )}
                  {td.reputation && (
                    <>
                      <dt className="text-muted-foreground">Reputation</dt>
                      <dd>{td.reputation}</dd>
                    </>
                  )}
                  {td.suspiciousScripts && (
                    <>
                      <dt className="text-muted-foreground">Scripts</dt>
                      <dd>{td.suspiciousScripts}</dd>
                    </>
                  )}
                  {td.hiddenIframes && (
                    <>
                      <dt className="text-muted-foreground">Iframes</dt>
                      <dd>{td.hiddenIframes}</dd>
                    </>
                  )}
                  {td.formSecurity && (
                    <>
                      <dt className="text-muted-foreground">Forms</dt>
                      <dd>{td.formSecurity}</dd>
                    </>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>
          )}

          {result.explainability?.featureContributions &&
            result.explainability.featureContributions.length > 0 && (
              <AccordionItem value="ml" className="border-border/50">
                <AccordionTrigger className="text-sm font-heading hover:no-underline py-3">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    ML feature importance (top signals)
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {result.explainability.featureContributions
                      .slice(0, 12)
                      .map((f, i) => (
                        <Badge
                          key={`${f.feature}-${i}`}
                          variant="outline"
                          className="font-mono text-[10px] border-primary/30"
                        >
                          {f.feature}: {f.importance.toFixed(3)}
                        </Badge>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
        </Accordion>

        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono">
          <span>
            Mode: {mode === "url" ? "URL" : "File"}
          </span>
          <span>•</span>
          <span>Processed in {result.processingTime}</span>
          {result.virusTotalScanId && (
            <>
              <span>•</span>
              <span>VT scan: {result.virusTotalScanId}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
