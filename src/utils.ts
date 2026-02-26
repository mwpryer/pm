import { execSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

export const CLI_TEMP_DIR = path.join(os.tmpdir(), "pm");

// Returns new array excluding specified values
export function exclude<T>(arr: T[], ...values: T[]): T[] {
  return arr.filter((item) => !values.includes(item));
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
