import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: process.env.VITE_HOST || "0.0.0.0",
    port: parseInt(process.env.VITE_PORT || "5000"),
    strictPort: true,
    hmr: {
      clientPort: parseInt(process.env.VITE_HMR_CLIENT_PORT || "443"),
    },
  },
});
