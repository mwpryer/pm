import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { serializeCommand } from "@/commands";
import { listWorkspacePackages, resolveWorkspaceDir } from "@/monorepo";
import { parseNi, parseNun } from "@/parse";

let root: string;

function write(rel: string, json: unknown) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(json));
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "pm-mono-"));
  write("package.json", { name: "root", workspaces: ["packages/*", "apps/*"] });
  write("packages/ui/package.json", { name: "@acme/ui" });
  write("packages/core/package.json", { name: "core" });
  write("apps/web/package.json", { name: "web" });
});

afterEach(() => {
  fs.rmSync(root, { recursive: true });
});

describe("listWorkspacePackages", () => {
  it("maps every package name to its directory", () => {
    const packages = listWorkspacePackages(root);
    expect(packages.get("@acme/ui")).toBe(path.join(root, "packages/ui"));
    expect(packages.get("core")).toBe(path.join(root, "packages/core"));
    expect(packages.get("web")).toBe(path.join(root, "apps/web"));
    expect(packages.size).toBe(3);
  });

  it("finds the root from a nested package", () => {
    const packages = listWorkspacePackages(path.join(root, "packages/ui"));
    expect(packages.get("core")).toBe(path.join(root, "packages/core"));
  });

  it("supports the { packages: [] } workspaces shape", () => {
    write("package.json", {
      name: "root",
      workspaces: { packages: ["apps/*"] },
    });
    const packages = listWorkspacePackages(root);
    expect([...packages.keys()]).toEqual(["web"]);
  });

  it("ignores node_modules", () => {
    write("packages/node_modules/dep/package.json", { name: "dep" });
    expect(listWorkspacePackages(root).has("dep")).toBe(false);
  });
});

describe("resolveWorkspaceDir", () => {
  it("resolves a package by name", () => {
    expect(resolveWorkspaceDir("@acme/ui", root)).toBe(
      path.join(root, "packages/ui"),
    );
  });

  it("accepts an existing path", () => {
    expect(resolveWorkspaceDir("packages/core", root)).toBe(
      path.join(root, "packages/core"),
    );
  });

  it("throws for an unknown package", () => {
    expect(() => resolveWorkspaceDir("nope", root)).toThrow(
      'Workspace package "nope" not found',
    );
  });
});

describe("bun workspace add/remove (name resolved to --cwd)", () => {
  it("ni -w resolves the package directory", () => {
    expect(
      serializeCommand(
        parseNi("bun", ["zod", "-w", "@acme/ui"], { cwd: root }),
      ),
    ).toBe(`bun add zod --cwd ${path.join(root, "packages/ui")}`);
  });

  it("nun -w resolves the package directory", () => {
    expect(
      serializeCommand(
        parseNun("bun", ["zod", "-w", "@acme/ui"], { cwd: root }),
      ),
    ).toBe(`bun remove zod --cwd ${path.join(root, "packages/ui")}`);
  });
});
