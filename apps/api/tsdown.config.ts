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
  clean: false,
  dts: true,
  entry: "src/app.ts",
  format: "esm",
  noExternal: "db",
});
