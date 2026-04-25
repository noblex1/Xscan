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
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Scan history
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading || isClearing}
              className="text-muted-foreground gap-1 text-xs"
              type="button"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={isLoading || isClearing || scans.length === 0}
              className="text-destructive gap-1 text-xs hover:text-destructive"
              type="button"
            >
              <Trash2 className={`w-3.5 h-3.5 ${isClearing ? "animate-pulse" : ""}`} />
              {isClearing ? "Clearing..." : "Clear"}
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive mb-3 font-mono">{errorMessage}</p>
      )}

      {!errorMessage && scans.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          No scans stored yet. Run an analysis above; results are saved on the server when MongoDB is connected.
        </p>
      )}

      {isLoading && scans.length === 0 && (
        <p className="text-sm text-muted-foreground font-mono">Loading history…</p>
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
                className="flex items-start sm:items-center gap-3 p-3 rounded-lg bg-card border border-border shadow-sm min-w-0"
              >
                <Icon className={`w-5 h-5 shrink-0 ${r.color}`} />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm text-foreground truncate font-mono" title={title}>
                    {title.length > 72 ? `${title.slice(0, 72)}…` : title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground break-words">
                    <span className="font-mono">{r.label}</span>
                    {" · "}
                    score {item.threatScore}
                    {" · "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {typeof onTogglePublic === 'function' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">Share</span>
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
