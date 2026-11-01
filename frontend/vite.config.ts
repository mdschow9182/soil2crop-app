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
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("/node_modules/")) return undefined;
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react-vendor";
          if (id.includes("/node_modules/recharts/") || id.includes("/node_modules/d3-") || id.includes("/node_modules/victory-vendor/")) return "charts-vendor";
          if (id.includes("/node_modules/@radix-ui/")) return "radix-vendor";
          if (id.includes("/node_modules/@tanstack/")) return "query-vendor";
          if (id.includes("/node_modules/lucide-react/")) return "icons-vendor";
          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
