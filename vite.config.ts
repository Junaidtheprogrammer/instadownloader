import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Only include dev plugins conditionally
const devPlugins = process.env.NODE_ENV !== "production" ? [] : [];

export default defineConfig({
  plugins: [
    react(),
    ...devPlugins,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"), // keep client as root
  build: {
    outDir: path.resolve(__dirname, "dist"), // Vercel expects index.html here
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
