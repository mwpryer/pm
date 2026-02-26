import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNa } from "@/parse";

const agent = "bun" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNa(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("na - bun", () => {
  it("passthrough", _("foo", "bun foo"));
  it("passthrough with args", _("run build --watch", "bun run build --watch"));
});
