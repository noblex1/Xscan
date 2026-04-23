import { motion } from "framer-motion";
import { Shield, Zap, Brain } from "lucide-react";

export type BackendStatus = "checking" | "ok" | "degraded" | "offline";
export type MlStatus = "checking" | "ok" | "offline";

const features = [
  {
    icon: Shield,
    label: "Multi-source intel",
    desc: "VirusTotal, Safe Browsing, PhishTank, SSL, heuristics",
  },
  { icon: Brain, label: "ML pipeline", desc: "Python service scores URL & content features" },
  { icon: Zap, label: "Single API", desc: "Backend orchestrates scans in one request" },
];

interface HeroSectionProps {
  backendStatus: BackendStatus;
  mlStatus: MlStatus;
}

function statusLabel(s: BackendStatus): { text: string; pulse: boolean; warn: boolean } {
  switch (s) {
    case "checking":
      return { text: "Checking API…", pulse: true, warn: false };
    case "ok":
      return { text: "API online", pulse: true, warn: false };
    case "degraded":
      return { text: "API up (DB offline)", pulse: true, warn: true };
    case "offline":
      return { text: "API unreachable", pulse: false, warn: true };
    default:
      return { text: "Unknown", pulse: false, warn: true };
  }
}

function mlStatusLabel(s: MlStatus, apiDown: boolean): { text: string; pulse: boolean; warn: boolean } {
  if (apiDown) {
    return { text: "ML: —", pulse: false, warn: true };
  }
  switch (s) {
    case "checking":
      return { text: "Checking ML…", pulse: true, warn: false };
    case "ok":
      return { text: "ML service ready", pulse: true, warn: false };
    case "offline":
      return { text: "ML offline (heuristics only)", pulse: false, warn: true };
    default:
      return { text: "ML: unknown", pulse: false, warn: true };
  }
}

const HeroSection = ({ backendStatus, mlStatus }: HeroSectionProps) => {
  const st = statusLabel(backendStatus);
  const ml = mlStatusLabel(mlStatus, backendStatus === "offline");

  return (
    <section className="py-12 md:py-16">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 mb-6">
            <div
              className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border w-full sm:w-auto min-w-0 ${
                st.warn
                  ? "border-warning/25 bg-warning/10 text-warning-foreground"
                  : "border-border bg-card"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  st.warn ? "bg-warning" : "bg-primary"
                } ${st.pulse ? "animate-pulse-glow" : ""}`}
              />
              <span className="text-xs sm:text-sm font-mono text-foreground/90 break-words">{st.text}</span>
            </div>
            <div
              className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border w-full sm:w-auto min-w-0 ${
                ml.warn
                  ? "border-warning/25 bg-warning/10 text-warning-foreground"
                  : "border-border bg-card"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  ml.warn ? "bg-warning" : "bg-primary"
                } ${ml.pulse ? "animate-pulse-glow" : ""}`}
              />
              <span className="text-xs sm:text-sm font-mono text-foreground/90 break-words">{ml.text}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight mb-4 md:mb-5">
            <span className="text-foreground">Catchers AI</span>
            <br />
            <span className="text-muted-foreground">Threat scanner</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-1 leading-relaxed">
            Analyze URLs and file or email content through the same pipeline your backend uses:
            threat intelligence, WHOIS/redirect features, and the ML microservice — exposed here via
            the REST API.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl bg-card border border-border text-center min-w-0 shadow-sm"
            >
              <f.icon className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-foreground text-sm break-words">{f.label}</span>
              <span className="text-[11px] sm:text-xs text-muted-foreground leading-snug break-words">
                {f.desc}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
