import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNun } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNun(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nun - pnpm", () => {
  it("single package", _("axios", "pnpm remove axios"));
  it("multiple packages", _("axios lodash", "pnpm remove axios lodash"));
  it("global", _("-g eslint", "pnpm remove --global eslint"));
});
