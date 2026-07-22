import fs from "node:fs";
import path from "node:path";
import { getPackageJson, walkUp } from "@/fs";

// Normalizes the workspaces field (array or { packages: [] }) to glob patterns
function getWorkspaceGlobs(
  pkg: Record<string, unknown> | undefined,
): string[] | undefined {
  const ws = pkg?.workspaces;
  let patterns: unknown[] | undefined;

  if (Array.isArray(ws)) {
    patterns = ws;
  } else if (ws && typeof ws === "object") {
    const inner = (ws as { packages?: unknown }).packages;
    if (Array.isArray(inner)) patterns = inner;
  }

  return patterns?.filter((p): p is string => typeof p === "string");
}

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listDirs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter(
        (e) =>
          e.isDirectory() && e.name !== "node_modules" && e.name[0] !== ".",
      )
      .map((e) => path.join(dir, e.name));
  } catch {
    return [];
  }
}

function listDirsRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const sub of listDirs(dir)) {
    out.push(sub, ...listDirsRecursive(sub));
  }
  return out;
}

// Expands a workspace glob (literal paths plus "*" and "**" segments)
function expandGlob(root: string, pattern: string): string[] {
  let dirs = [root];
  for (const segment of pattern.split("/").filter(Boolean)) {
    const next: string[] = [];
    for (const dir of dirs) {
      if (segment === "*") {
        next.push(...listDirs(dir));
      } else if (segment === "**") {
        next.push(dir, ...listDirsRecursive(dir));
      } else {
        const child = path.join(dir, segment);
        if (isDir(child)) next.push(child);
      }
    }
    dirs = next;
  }
  return dirs;
}

// Maps every workspace package name to its absolute directory
export function listWorkspacePackages(
  cwd: string = process.cwd(),
): Map<string, string> {
  const packages = new Map<string, string>();

  for (const root of walkUp(cwd)) {
    const globs = getWorkspaceGlobs(getPackageJson(root));
    if (!globs) continue;
    for (const glob of globs) {
      for (const dir of expandGlob(root, glob)) {
        const name = getPackageJson(dir)?.name;
        if (typeof name === "string") packages.set(name, dir);
      }
    }
    break;
  }

  return packages;
}

// Resolves a package name (or path) to a directory; bun targets workspaces via --cwd, not name
export function resolveWorkspaceDir(
  nameOrPath: string,
  cwd: string = process.cwd(),
): string {
  const byName = listWorkspacePackages(cwd).get(nameOrPath);
  if (byName) return byName;

  const asPath = path.resolve(cwd, nameOrPath);
  if (isDir(asPath)) return asPath;

  throw new Error(`Workspace package "${nameOrPath}" not found`);
}
