import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { detect } from "@/detect";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pm-detect-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true });
});

describe("detect", () => {
  it("detects bun from bun.lock", () => {
    fs.writeFileSync(path.join(tmpDir, "bun.lock"), "");
    expect(detect(tmpDir)).toBe("bun");
  });

  it("detects bun from bun.lockb", () => {
    fs.writeFileSync(path.join(tmpDir, "bun.lockb"), "");
    expect(detect(tmpDir)).toBe("bun");
  });

  it("detects pnpm from pnpm-lock.yaml", () => {
    fs.writeFileSync(path.join(tmpDir, "pnpm-lock.yaml"), "");
    expect(detect(tmpDir)).toBe("pnpm");
  });

  it("detects pnpm from pnpm-workspace.yaml", () => {
    fs.writeFileSync(path.join(tmpDir, "pnpm-workspace.yaml"), "");
    expect(detect(tmpDir)).toBe("pnpm");
  });

  it("detects npm from package-lock.json", () => {
    fs.writeFileSync(path.join(tmpDir, "package-lock.json"), "{}");
    expect(detect(tmpDir)).toBe("npm");
  });

  it("falls back to packageManager field", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ packageManager: "pnpm@9.1.0" }),
    );
    expect(detect(tmpDir)).toBe("pnpm");
  });

  it("returns undefined when nothing detected", () => {
    expect(detect(tmpDir)).toBeUndefined();
  });

  it("lockfile takes priority over packageManager field", () => {
    fs.writeFileSync(path.join(tmpDir, "bun.lock"), "");
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ packageManager: "npm@10.0.0" }),
    );
    expect(detect(tmpDir)).toBe("bun");
  });
});
