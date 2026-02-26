import fs from "node:fs";
import path from "node:path";
import type { Agent } from "@/types";

const LOCKFILE_MAP: [string, Agent][] = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["pnpm-workspace.yaml", "pnpm"],
  ["package-lock.json", "npm"],
];

// Detects PM from lockfiles and packageManager field
export function detect(cwd: string = process.cwd()): Agent | undefined {
  // Check lockfiles in priority order
  for (const [lockfile, agent] of LOCKFILE_MAP) {
    if (fs.existsSync(path.join(cwd, lockfile))) {
      return agent;
    }
  }

  // Fall back to packageManager field in package.json
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (typeof pkg.packageManager === "string") {
        const name = pkg.packageManager.split("@")[0];
        if (name === "npm" || name === "pnpm" || name === "bun") {
          return name;
        }
      }
    } catch {
      // Ignore malformed package.json
    }
  }

  return undefined;
}
