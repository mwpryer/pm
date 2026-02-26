import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNd } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNd(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nd - npm", () => {
  it("dedupe", _("", "npm dedupe"));
  it("-c (dry-run)", _("-c", "npm dedupe --dry-run"));
});
