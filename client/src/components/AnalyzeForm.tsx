import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, FileText, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}

function inferFileType(content: string): string | undefined {
  const c = content.trim().toLowerCase();
  if (c.startsWith("<!doctype html") || c.includes("<html")) return "text/html";
  return undefined;
}

const AnalyzeForm = ({ onSubmit, isLoading }: AnalyzeFormProps) => {
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
      className="container max-w-2xl"
    >
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 glow-primary">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as AnalyzeMode)}
          className="mb-4"
        >
          <TabsList className="bg-muted border border-border w-full grid grid-cols-2 h-auto">
            <TabsTrigger
              value="url"
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Link className="w-4 h-4" /> URL
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-4 h-4" /> File / email body
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-mono">
              Sends <span className="text-foreground/80">POST /api/v1/threats/analyze-url</span> — VirusTotal,
              Safe Browsing, PhishTank, ML, SSL, and heuristics.
            </p>
            <Textarea
              placeholder="Paste a URL (or text containing an https:// link)…"
              className="min-h-[100px] bg-input border-border font-mono text-sm resize-none focus:ring-primary focus:border-primary"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="file" className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground font-mono">
              Sends <span className="text-foreground/80">POST /api/v1/threats/analyze-file</span> — ML content
              model plus HTML/script/form heuristics.
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
                className="font-mono text-sm bg-input border-border"
              />
            </div>
            <Textarea
              placeholder="Paste HTML, email source, or plain text…"
              className="min-h-[160px] bg-input border-border font-mono text-sm resize-none focus:ring-primary focus:border-primary"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold text-sm sm:text-base h-11 sm:h-12"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Search className="w-5 h-5" /> Run threat analysis
            </>
          )}
        </Button>
      </div>
    </motion.section>
  );
};

export default AnalyzeForm;
