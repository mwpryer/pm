import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNun } from "@/parse";

const agent = "bun" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNun(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nun - bun", () => {
  it("single package", _("axios", "bun remove axios"));
  it("multiple packages", _("axios lodash", "bun remove axios lodash"));
  it("global", _("-g eslint", "bun remove -g eslint"));
});
