import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldCheck, ShieldAlert, ShieldX, RefreshCw, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { RiskCategory, ScanHistoryDocument } from "@/types/threat";

const riskVisual: Record<
  RiskCategory,
  { icon: typeof ShieldCheck; color: string; label: string }
> = {
  LOW: { icon: ShieldCheck, color: "text-safe", label: "LOW" },
  MEDIUM: { icon: ShieldAlert, color: "text-warning", label: "MED" },
  HIGH: { icon: ShieldX, color: "text-destructive", label: "HIGH" },
  CRITICAL: { icon: ShieldX, color: "text-destructive", label: "CRIT" },
};

interface Props {
  scans: ScanHistoryDocument[];
  isLoading?: boolean;
  isClearing?: boolean;
  onRefresh?: () => void;
  onClear?: () => void;
  onTogglePublic?: (id: string, makePublic: boolean) => Promise<void>;
  errorMessage?: string | null;
}

function scanTitle(s: ScanHistoryDocument): string {
  if (s.url) return s.url;
  if (s.fileName) return s.fileName;
  return "Scan";
}

const HistorySection = ({
  scans,
  isLoading,
  isClearing,
  onRefresh,
  onClear,
  errorMessage,
}: Props) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-2xl"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-heading font-semibold text-foreground">Scan history</h2>
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading || isClearing}
              className="gap-1 text-xs text-muted-foreground"
              type="button"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={isLoading || isClearing || scans.length === 0}
              className="gap-1 text-xs text-destructive hover:text-destructive"
              type="button"
            >
              <Trash2 className={`h-3.5 w-3.5 ${isClearing ? "animate-pulse" : ""}`} />
              {isClearing ? "Clearing..." : "Clear"}
            </Button>
          )}
        </div>
      </div>

      {errorMessage && <p className="mb-3 font-mono text-sm text-destructive">{errorMessage}</p>}

      {isLoading && scans.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">Loading history...</p>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {scans.map((item) => {
            const r = riskVisual[item.riskCategory];
            const Icon = r.icon;
            const title = scanTitle(item);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:items-center"
              >
                <Icon className={`h-5 w-5 shrink-0 ${r.color}`} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate font-mono text-sm text-foreground" title={title}>
                    {title.length > 72 ? `${title.slice(0, 72)}...` : title}
                  </p>
                  <p className="break-words text-[11px] text-muted-foreground sm:text-xs">
                    <span className="font-mono">{r.label}</span>
                    {" | "}
                    score {item.threatScore}
                    {" | "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {typeof onTogglePublic === "function" && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Share</span>
                      <Switch
                        checked={!!item.isPublic}
                        onCheckedChange={(v) => onTogglePublic(item._id, !!v)}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default HistorySection;
