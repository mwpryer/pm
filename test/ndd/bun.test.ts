import { describe, expect, it } from "bun:test";
import { UnsupportedCommand } from "@/commands";
import { parseNdd } from "@/parse";

const agent = "bun" as const;

describe("ndd - bun", () => {
  it("throws UnsupportedCommand", () => {
    expect(() => parseNdd(agent, [])).toThrow(UnsupportedCommand);
  });
});
