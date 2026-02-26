import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNci } from "@/parse";

const agent = "bun" as const;

describe("nci - bun", () => {
  it("with lockfile → frozen install", () => {
    expect(serializeCommand(parseNci(agent, [], { hasLock: true }))).toBe(
      "bun install --frozen-lockfile",
    );
  });

  it("without lockfile → regular install", () => {
    expect(serializeCommand(parseNci(agent, [], { hasLock: false }))).toBe(
      "bun install",
    );
  });
});
