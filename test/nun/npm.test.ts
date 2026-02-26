import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNun } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNun(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nun - npm", () => {
  it("single package", _("axios", "npm uninstall axios"));
  it("multiple packages", _("axios lodash", "npm uninstall axios lodash"));
  it("global", _("-g eslint", "npm uninstall -g eslint"));
});
