import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./", // Make sure this points to the frontend root
  build: {
    outDir: "../backend/dist", // Build output goes to the backend for server-side handling
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000", // Proxy API requests to your backend
    },
  },
});
