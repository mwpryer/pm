import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNup } from "@/parse";

const agent = "bun" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNup(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nup - bun", () => {
  it("upgrade", _("", "bun update"));
  it("upgrade with args", _("axios", "bun update axios"));
  it("interactive", _("-i", "bun update -i"));
});
