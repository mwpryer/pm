import fs from "node:fs";
import path from "node:path";

// Reads and parses package.json from cwd
export function getPackageJson(
  cwd: string = process.cwd(),
): Record<string, unknown> | undefined {
  const pkgPath = path.join(cwd, "package.json");

  try {
    return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  } catch {
    return undefined;
  }
}
