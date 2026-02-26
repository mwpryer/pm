import fs from "node:fs";
import path from "node:path";
import { CLI_TEMP_DIR } from "@/utils";

interface Storage {
  lastRunCommand?: string;
}

const STORAGE_PATH = path.join(CLI_TEMP_DIR, "_storage.json");

// Reads storage from disk
export function loadStorage(): Storage {
  try {
    return JSON.parse(fs.readFileSync(STORAGE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

// Writes storage atomically using a PID-based temp file
export function saveStorage(data: Storage): void {
  fs.mkdirSync(CLI_TEMP_DIR, { recursive: true });
  const tmpPath = `${STORAGE_PATH}.${process.pid}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, STORAGE_PATH);
}
