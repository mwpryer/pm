import { execSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

export const CLI_TEMP_DIR = path.join(os.tmpdir(), "pm");

// Returns new array excluding specified values
export function exclude<T>(arr: T[], ...values: T[]): T[] {
  return arr.filter((item) => !values.includes(item));
}

// Extracts a value-taking flag (e.g. -w <pkg>, -C <dir>); rest drops both tokens
export function extractFlag(
  args: string[],
  flag: string,
): { found: boolean; value?: string; rest: string[] } {
  const i = args.indexOf(flag);
  if (i === -1) return { found: false, rest: args };

  return {
    found: true,
    value: args[i + 1],
    rest: [...args.slice(0, i), ...args.slice(i + 2)],
  };
}

// Checks if a command exists on the system
export function cmdExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
