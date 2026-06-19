import fs from "node:fs";
import path from "node:path";
import { getPackageJson, walkUp } from "@/fs";
import type { Agent } from "@/types";

const LOCKFILE_MAP: [string, Agent][] = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["pnpm-workspace.yaml", "pnpm"],
  ["package-lock.json", "npm"],
];

// Detects PM from lockfiles and packageManager field, walking up for monorepos
export function detect(cwd: string = process.cwd()): Agent | undefined {
  for (const dir of walkUp(cwd)) {
    for (const [lockfile, agent] of LOCKFILE_MAP) {
      if (fs.existsSync(path.join(dir, lockfile))) {
        return agent;
      }
    }

    const packageManager = getPackageJson(dir)?.packageManager;
    if (typeof packageManager === "string") {
      const name = packageManager.split("@")[0];
      if (name === "npm" || name === "pnpm" || name === "bun") {
        return name;
      }
    }
  }

  return undefined;
}
