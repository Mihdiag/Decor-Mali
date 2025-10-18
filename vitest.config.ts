// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",                // important pour Netlify
  plugins: [react()],
  build: {
    outDir: "dist",         // <-- dossier de sortie unique
    emptyOutDir: true,
  },
});
