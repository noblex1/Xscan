import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (err) => {
            console.warn(
              "[vite proxy] /api → backend failed (is the API running on http://localhost:3000 ?):",
              err.message
            );
          });
        },
      },
      "/health": {
        target: "http://localhost:3000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (err) => {
            console.warn(
              "[vite proxy] /health → backend failed (is the API running on http://localhost:3000 ?):",
              err.message
            );
          });
        },
      },
      "/ready": {
        target: "http://localhost:3000",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (err) => {
            console.warn(
              "[vite proxy] /ready → backend failed (is the API running on http://localhost:3000 ?):",
              err.message
            );
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
