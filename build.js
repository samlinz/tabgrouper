const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/test.ts", "src/background.ts"],
    bundle: true,
    // outfile: "out/test.js",
    outdir: "out",
    minify: true,
    sourcemap: true,
    target: ["firefox60"],
    platform: "browser",
    format: "esm",
    tsconfig: "./tsconfig.json",
  })
  .catch(() => process.exit(1));
