import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNci } from "@/parse";

const agent = "npm" as const;

describe("nci - npm", () => {
  it("with lockfile → frozen install", () => {
    expect(serializeCommand(parseNci(agent, [], { hasLock: true }))).toBe(
      "npm ci",
    );
  });

  it("without lockfile → regular install", () => {
    expect(serializeCommand(parseNci(agent, [], { hasLock: false }))).toBe(
      "npm i",
    );
  });
});
