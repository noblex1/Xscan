import { motion } from "framer-motion";
import { SearchCheck, Shield, FileWarning } from "lucide-react";

const steps = [
  {
    title: "1. Submit URL or content",
    description:
      "Paste a suspicious URL, email body, or file content into the scanner form.",
    icon: SearchCheck,
  },
  {
    title: "2. Multi-layer analysis",
    description:
      "Catchers AI combines threat intelligence, heuristics, WHOIS/redirect checks, and ML scoring.",
    icon: Shield,
  },
  {
    title: "3. Get clear results",
    description:
      "Review risk score, triggered indicators, recommendations, and export a PDF report.",
    icon: FileWarning,
  },
];

const HowItWorksSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container max-w-4xl"
    >
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
          How it works
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          Three quick steps from input to explainable threat results.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((step) => (
            <div key={step.title} className="rounded-lg border border-border bg-background p-3 sm:p-4 min-w-0">
              <step.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-heading font-semibold text-xs sm:text-sm text-foreground mb-1.5 break-words">
                {step.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed break-words">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorksSection;
