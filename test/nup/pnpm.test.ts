import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNup } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNup(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nup - pnpm", () => {
  it("upgrade", _("", "pnpm update"));
  it("upgrade with args", _("axios", "pnpm update axios"));
  it("interactive", _("-i", "pnpm update -i"));
});
