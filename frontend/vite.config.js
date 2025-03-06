import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], 
  root:'./',               // Points to frontend folder
  build: {
    outDir: '../backend/dist',                      // Build output folder
  },
  server: {
    fs: {
      allow: ["..", "node_modules/slick-carousel"],
    },
  },
});
