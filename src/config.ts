import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Agent, Config } from "@/types";
import * as v from "valibot";

const ConfigSchema = v.object({
  defaultAgent: v.optional(v.picklist(["npm", "pnpm", "bun"]), "npm"),
  globalAgent: v.optional(v.picklist(["npm", "pnpm", "bun"]), "npm"),
});

function loadConfigFile(): Record<string, unknown> {
  const configPath =
    process.env.PM_CONFIG_FILE || path.join(os.homedir(), ".pmrc.json");

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Loads config from file + env vars with priority: env > file > defaults
export function getConfig(): Config {
  const fileConfig = loadConfigFile();

  // Env vars override file values
  if (process.env.PM_DEFAULT_AGENT) {
    fileConfig.defaultAgent = process.env.PM_DEFAULT_AGENT;
  }
  if (process.env.PM_GLOBAL_AGENT) {
    fileConfig.globalAgent = process.env.PM_GLOBAL_AGENT;
  }

  const result = v.safeParse(ConfigSchema, fileConfig);
  if (!result.success) {
    const issues = result.issues
      .map((i) => `  ${i.path?.map((p) => p.key).join(".")}: ${i.message}`)
      .join("\n");
    console.error(`Invalid pm config:\n${issues}`);
    process.exit(1);
  }

  return result.output;
}

export function getDefaultAgent(): Config["defaultAgent"] {
  return getConfig().defaultAgent;
}

export function getGlobalAgent(): Agent {
  return getConfig().globalAgent;
}
