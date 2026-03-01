const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/readtime.js"],
  outfile: "dist/readtime.min.js",
  bundle: false,
  minify: true,
  sourcemap: true,
  target: ["es2018"],
}).catch(() => process.exit(1));