import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, "..");
const distDir = path.join(
  packageDir,
  "node_modules",
  "@outscope",
  "orpc-hono",
  "dist",
);

if (!fs.existsSync(distDir)) {
  console.warn(
    "[fix-orpc-hono-imports] Skipping patch; @outscope/orpc-hono not installed.",
  );
  process.exit(0);
}

const importPattern = /(from\s+['"])([^'"]+)(['"])/g;

function shouldAppendExtension(specifier) {
  return (
    specifier.startsWith(".") &&
    !specifier.endsWith(".js") &&
    !specifier.endsWith(".mjs") &&
    !specifier.endsWith(".cjs")
  );
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(entryPath);
    }
  }

  return files;
}

let patchedFiles = 0;

for (const filePath of walk(distDir)) {
  const original = fs.readFileSync(filePath, "utf8");

  const transformed = original.replace(
    importPattern,
    (full, prefix, specifier, suffix) => {
      if (shouldAppendExtension(specifier)) {
        return `${prefix}${specifier}.js${suffix}`;
      }
      return full;
    },
  );

  if (transformed !== original) {
    fs.writeFileSync(filePath, transformed, "utf8");
    patchedFiles += 1;
  }
}

if (patchedFiles > 0) {
  console.info(
    `[fix-orpc-hono-imports] Updated ${patchedFiles} file(s) to use explicit .js extensions.`,
  );
} else {
  console.info("[fix-orpc-hono-imports] No changes required.");
}
