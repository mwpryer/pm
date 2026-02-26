import { describe, expect, it } from "bun:test";
import { UnsupportedCommand, serializeCommand } from "@/commands";
import { parseNup } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNup(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nup - npm", () => {
  it("upgrade", _("", "npm update"));
  it("upgrade with args", _("axios", "npm update axios"));
  it("-i throws UnsupportedCommand", () => {
    expect(() => parseNup(agent, ["-i"])).toThrow(UnsupportedCommand);
  });
});
