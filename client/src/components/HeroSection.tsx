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
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                st.warn
                  ? "border-warning/40 bg-warning/10"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  st.warn ? "bg-warning" : "bg-primary"
                } ${st.pulse ? "animate-pulse-glow" : ""}`}
              />
              <span className="text-sm font-mono text-foreground/90">{st.text}</span>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                ml.warn
                  ? "border-warning/40 bg-warning/10"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  ml.warn ? "bg-warning" : "bg-primary"
                } ${ml.pulse ? "animate-pulse-glow" : ""}`}
              />
              <span className="text-sm font-mono text-foreground/90">{ml.text}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight mb-6">
            <span className="text-foreground">Catchers AI</span>
            <br />
            <span className="text-gradient-primary">Threat scanner</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12">
            Analyze URLs and file or email content through the same pipeline your backend uses:
            threat intelligence, WHOIS/redirect features, and the ML microservice — exposed here via
            the REST API.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-center"
            >
              <f.icon className="w-6 h-6 text-primary" />
              <span className="font-heading font-semibold text-foreground text-sm">{f.label}</span>
              <span className="text-xs text-muted-foreground leading-snug">{f.desc}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
