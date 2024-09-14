const esbuild = require("esbuild");
const fs = require("node:fs");
const glob = require("glob");

const staticFiles = [
  ["./resources/options.html", "./out/options.html"],
  ["./resources/small.png", "./out/small.png"],
];

esbuild
  .build({
    entryPoints: ["src/background.ts", "src/options.ts"],
    bundle: true,
    outdir: "out",
    minify: true,
    sourcemap: true,
    target: ["firefox60"],
    platform: "browser",
    format: "esm",
    tsconfig: "./tsconfig.json",
  })
  .then(() => {
    staticFiles.forEach(([input, output]) => {
      glob.sync(input).forEach((file) => {
        console.log(`Copying ${file} to ${output}`);
        fs.copyFileSync(file, output);
      });
    });
  })
  .catch(() => process.exit(1));
