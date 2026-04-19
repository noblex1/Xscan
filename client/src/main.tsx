import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Drop stale service workers (e.g. old PWA / Workbox builds) so /api and /health
// hit the Vite dev server proxy instead of being intercepted or cached incorrectly.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const r of regs) void r.unregister();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
