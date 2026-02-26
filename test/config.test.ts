import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getConfig } from "@/config";

let tmpDir: string;
let configPath: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pm-config-"));
  configPath = path.join(tmpDir, ".pmrc.json");
  // Point config to temp file
  process.env.PM_CONFIG_FILE = configPath;
  // Clear other env vars
  process.env.PM_DEFAULT_AGENT = undefined;
  process.env.PM_GLOBAL_AGENT = undefined;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true });
  process.env.PM_CONFIG_FILE = undefined;
  process.env.PM_DEFAULT_AGENT = undefined;
  process.env.PM_GLOBAL_AGENT = undefined;
});

describe("getConfig", () => {
  it("returns defaults when no config file", () => {
    const config = getConfig();
    expect(config.defaultAgent).toBe("npm");
    expect(config.globalAgent).toBe("npm");
  });

  it("reads config from file", () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ defaultAgent: "bun", globalAgent: "pnpm" }),
    );
    const config = getConfig();
    expect(config.defaultAgent).toBe("bun");
    expect(config.globalAgent).toBe("pnpm");
  });

  it("env vars override file values", () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ defaultAgent: "bun", globalAgent: "pnpm" }),
    );
    process.env.PM_DEFAULT_AGENT = "npm";
    process.env.PM_GLOBAL_AGENT = "bun";
    const config = getConfig();
    expect(config.defaultAgent).toBe("npm");
    expect(config.globalAgent).toBe("bun");
  });

  it("partial config merges with defaults", () => {
    fs.writeFileSync(configPath, JSON.stringify({ globalAgent: "bun" }));
    const config = getConfig();
    expect(config.defaultAgent).toBe("npm");
    expect(config.globalAgent).toBe("bun");
  });

  it("invalid config values cause exit with error", () => {
    fs.writeFileSync(configPath, JSON.stringify({ defaultAgent: "yarn" }));
    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});

    expect(() => getConfig()).toThrow("process.exit");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
