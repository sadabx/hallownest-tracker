import { defineConfig } from "vite";

export default defineConfig({
  base: "/hallownest-tracker/",
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
