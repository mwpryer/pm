import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNdd } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNdd(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("ndd - npm", () => {
  it("dedupe", _("", "npm dedupe"));
  it("-c (dry-run)", _("-c", "npm dedupe --dry-run"));
});
