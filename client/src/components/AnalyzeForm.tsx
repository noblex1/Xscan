import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, FileText, Link, CheckCircle2, Circle, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export type AnalyzeMode = "url" | "file";

export interface AnalyzePayload {
  mode: AnalyzeMode;
  url?: string;
  fileName?: string;
  fileContent?: string;
  fileType?: string;
}

interface AnalyzeFormProps {
  onSubmit: (payload: AnalyzePayload) => void;
  isLoading: boolean;
  scanProgress: number;
  scanStage: string;
  scanSteps: Array<{ id: string; label: string; status: "pending" | "active" | "complete" }>;
}

function inferFileType(content: string): string | undefined {
  const c = content.trim().toLowerCase();
  if (c.startsWith("<!doctype html") || c.includes("<html")) return "text/html";
  return undefined;
}

const AnalyzeForm = ({ onSubmit, isLoading, scanProgress, scanStage, scanSteps }: AnalyzeFormProps) => {
  const [tab, setTab] = useState<AnalyzeMode>("url");
  const [urlInput, setUrlInput] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("pasted-content.txt");

  const handleSubmit = () => {
    if (tab === "url") {
      const v = urlInput.trim();
      if (v) onSubmit({ mode: "url", url: v });
      return;
    }
    const content = fileContent.trim();
    if (!content) return;
    const name = fileName.trim() || "pasted-content.txt";
    const fileType = inferFileType(content);
    onSubmit({ mode: "file", fileName: name, fileContent: content, fileType });
  };

  const canSubmit =
    tab === "url" ? urlInput.trim().length > 0 : fileContent.trim().length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="container max-w-5xl"
    >
      <div className="overflow-hidden rounded-2xl border border-border/90 bg-card/95 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 sm:p-7 md:p-8">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Threat Analysis Console</p>
              <h3 className="mt-2 font-heading text-xl font-semibold text-foreground sm:text-2xl">
                Scan suspicious links and content
              </h3>
            </div>

            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as AnalyzeMode)}
              className="mb-5"
            >
              <TabsList className="bg-muted/70 border border-border w-full grid grid-cols-2 h-auto rounded-xl p-1">
                <TabsTrigger
                  value="url"
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Link className="w-4 h-4" /> URL Scan
                </TabsTrigger>
                <TabsTrigger
                  value="file"
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <FileText className="w-4 h-4" /> File Scan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground font-mono">
                  Multi-source checks: VirusTotal, Safe Browsing, PhishTank, SSL, ML, and heuristics.
                </p>
                <Textarea
                  placeholder="Paste a URL (or text containing an https:// link)..."
                  className="min-h-[120px] rounded-xl bg-input/70 border-border font-mono text-sm resize-none focus:ring-ring focus:border-ring"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="file" className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground font-mono">
                  Content checks: ML analysis plus script/form and phishing language heuristics.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="file-name" className="text-xs font-mono text-muted-foreground">
                    File name
                  </Label>
                  <Input
                    id="file-name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. suspicious.html"
                    className="font-mono text-sm rounded-xl bg-input/70 border-border"
                  />
                </div>
                <Textarea
                  placeholder="Paste HTML, email source, or plain text..."
                  className="min-h-[170px] rounded-xl bg-input/70 border-border font-mono text-sm resize-none focus:ring-ring focus:border-ring"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold text-sm sm:text-base h-11 sm:h-12 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Scanning in progress...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Run threat analysis
                </>
              )}
            </Button>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-border/80 bg-gradient-to-b from-background to-muted/30 p-5 sm:p-7 md:p-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-heading font-semibold text-foreground">Scan Progress</span>
              <span className="font-mono text-xs text-muted-foreground">
                {isLoading ? `${scanProgress}%` : "Idle"}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {isLoading ? scanStage : "Start a scan to see live pipeline status and checks."}
            </p>

            <Progress
              value={scanProgress}
              className="mt-4 h-2.5 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-cyan-400"
            />

            <div className="mt-6 space-y-3">
              {scanSteps.map((step) => {
                const statusIcon =
                  step.status === "complete" ? (
                    <CheckCircle2 className="h-4 w-4 text-safe" />
                  ) : step.status === "active" ? (
                    <CircleDashed className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/70" />
                  );

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 ${
                      step.status === "active" ? "bg-primary/10" : ""
                    }`}
                  >
                    {statusIcon}
                    <span
                      className={`text-sm ${
                        step.status === "pending"
                          ? "text-muted-foreground"
                          : step.status === "active"
                            ? "text-primary font-medium"
                            : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AnalyzeForm;
