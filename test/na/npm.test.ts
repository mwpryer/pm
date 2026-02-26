import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNa } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNa(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("na - npm", () => {
  it("passthrough", _("foo", "npm foo"));
  it("passthrough with args", _("run build --watch", "npm run build --watch"));
});
