import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNci } from "@/parse";

const agent = "pnpm" as const;

describe("nci - pnpm", () => {
  it("with lockfile → frozen install", () => {
    expect(serializeCommand(parseNci(agent, [], { hasLock: true }))).toBe(
      "pnpm i --frozen-lockfile",
    );
  });

  it("without lockfile → regular install", () => {
    expect(serializeCommand(parseNci(agent, [], { hasLock: false }))).toBe(
      "pnpm i",
    );
  });
});
