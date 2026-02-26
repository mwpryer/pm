import { describe, expect, it } from "bun:test";
import { UnsupportedCommand } from "@/commands";
import { parseNd } from "@/parse";

const agent = "bun" as const;

describe("nd - bun", () => {
  it("throws UnsupportedCommand", () => {
    expect(() => parseNd(agent, [])).toThrow(UnsupportedCommand);
  });
});
