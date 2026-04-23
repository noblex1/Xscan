import { Shield } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <span className="font-heading text-sm sm:text-base font-semibold text-foreground truncate">
            Catchers AI Threat Scanner
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#scan-form" className="hover:text-foreground transition-colors">
            Scan
          </a>
          <a href="#scan-history" className="hover:text-foreground transition-colors">
            History
          </a>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
