import { readdir } from "node:fs/promises";

const pkg = await Bun.file("package.json").json();

const cliDir = "src/cli";
const cliFiles = (await readdir(cliDir)).filter((f) => f.endsWith(".ts"));

const result = await Bun.build({
  entrypoints: cliFiles.map((f) => `${cliDir}/${f}`),
  outdir: "dist",
  root: "src",
  target: "node",
  minify: true,
  banner: "#!/usr/bin/env node",
  external: Object.keys(pkg.dependencies),
  define: {
    __PM_VERSION__: JSON.stringify(pkg.version),
  },
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(
  `Built ${result.outputs.length} files (${cliFiles.length} CLI entries)`,
);
