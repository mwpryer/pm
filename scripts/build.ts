import { chmod, readdir } from "node:fs/promises";
import { join } from "node:path";

const pkg = await Bun.file("package.json").json();

const cliDir = "src/cli";
const cliFiles = (await readdir(cliDir)).filter((f) => f.endsWith(".ts"));
const cliEntrypoints = cliFiles.map((f) => join(cliDir, f));

const result = await Bun.build({
  entrypoints: ["src/index.ts", ...cliEntrypoints],
  outdir: "dist",
  root: "src",
  target: "node",
  format: "esm",
  external: Object.keys(pkg.dependencies),
  define: {
    __PM_VERSION__: JSON.stringify(pkg.version),
  },
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Add shebang to CLI files and make executable
const shebang = "#!/usr/bin/env node\n";
for (const file of cliFiles) {
  const outPath = join("dist", "cli", file.replace(".ts", ".js"));
  const content = await Bun.file(outPath).text();
  await Bun.write(outPath, shebang + content);
  await chmod(outPath, 0o755);
}

console.log(
  `Built ${result.outputs.length} files (${cliFiles.length} CLI entries)`,
);
