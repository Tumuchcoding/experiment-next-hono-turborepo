import { defineConfig } from "tsdown";

/**
 * On Vercel
 *   Project Settings
 *   Build and Deployment
 *   Framework Settings
 *   Output Directory
 *   Override -> dist
 */
// tsdown.config.ts

export default defineConfig({
  alias: { "@": "./src" }, // <-- rewrite @/* to ./src/*
  clean: true,
  dts: true,
  // Build your serverless/edge entry under src/api/, not just src/app.ts
  // so Vercel will find /dist/api/* after build.
  entry: ["src/app.ts"], // <-- important
  format: "esm",
  noExternal: ["db"], // keep bundling workspace "db"
  outDir: "dist", // <-- ensure dist output
});
