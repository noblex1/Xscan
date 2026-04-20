import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StatisticsResponse } from "@/types/threat";

interface Props {
  stats: StatisticsResponse | undefined;
  isLoading: boolean;
  error: string | null;
}

const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const StatsBar = ({ stats, isLoading, error }: Props) => {
  if (error) {
    return (
      <div className="container max-w-2xl">
        <p className="text-xs font-mono text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="container max-w-2xl">
        <p className="text-xs font-mono text-muted-foreground">Loading statistics…</p>
      </div>
    );
  }

  if (!stats) return null;

  const dist = stats.threatDistribution ?? {};
  const avg =
    typeof stats.avgThreatScore === "number"
      ? stats.avgThreatScore.toFixed(1)
      : String(stats.avgThreatScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="container max-w-2xl"
    >
      <div className="rounded-xl border border-border bg-card/80 p-3 sm:p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-heading font-semibold text-foreground">
            Threat statistics
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Total</p>
            <p className="text-lg font-heading font-bold tabular-nums">{stats.totalScans}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase">24h</p>
            <p className="text-lg font-heading font-bold tabular-nums">{stats.recentScans}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-mono text-muted-foreground uppercase">Avg score</p>
            <p className="text-lg font-heading font-bold tabular-nums">{avg}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.map((k) => {
            const n = dist[k] ?? 0;
            return (
              <Badge
                key={k}
                variant="outline"
                className="font-mono text-[10px] border-border"
              >
                {k}: {n}
              </Badge>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsBar;
