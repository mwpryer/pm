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

// Yields cwd and each ancestor directory up to the filesystem root
export function* walkUp(cwd: string = process.cwd()): Generator<string> {
  let dir = path.resolve(cwd);
  const { root } = path.parse(dir);
  while (true) {
    yield dir;
    if (dir === root) break;
    dir = path.dirname(dir);
  }
}
