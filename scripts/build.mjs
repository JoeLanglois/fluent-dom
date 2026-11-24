// Build the distributable files from src/fluent-dom.js with esbuild.
//
// Three flavours, one source:
//   dist/fluent-dom.js      IIFE, unminified — readable, for copy-paste debugging
//   dist/fluent-dom.min.js  IIFE, minified   — the copy-paste / <script> file
//   dist/fluent-dom.esm.js  ESM,  minified   — the npm entry point
//
// Sizes (raw / gzip / brotli) are printed for every output: bundle size is
// a feature of this library, keep an eye on it.
import { build } from "esbuild";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { readFile, mkdir } from "node:fs/promises";

const shared = {
  entryPoints: ["src/fluent-dom.js"],
  bundle: true,
  target: "es2022",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "silent",
};

await mkdir("dist", { recursive: true });

await build({ ...shared, format: "iife", globalName: "FluentDom", minify: false, outfile: "dist/fluent-dom.js" });
await build({ ...shared, format: "iife", globalName: "FluentDom", minify: true, outfile: "dist/fluent-dom.min.js" });
await build({ ...shared, format: "esm", minify: true, outfile: "dist/fluent-dom.esm.js" });

for (const file of ["dist/fluent-dom.js", "dist/fluent-dom.min.js", "dist/fluent-dom.esm.js"]) {
  const bytes = await readFile(file);
  console.log(
    `${file}: raw ${bytes.length} B, gzip ${gzipSync(bytes).length} B, brotli ${brotliCompressSync(bytes).length} B`,
  );
}
