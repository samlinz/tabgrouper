const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/background.ts"],
    bundle: true,
    outdir: "out",
    minify: true,
    sourcemap: true,
    target: ["firefox60"],
    platform: "browser",
    format: "esm",
    tsconfig: "./tsconfig.json",
  })
  .catch(() => process.exit(1));
