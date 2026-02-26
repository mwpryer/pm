import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNd } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNd(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nd - pnpm", () => {
  it("dedupe", _("", "pnpm dedupe"));
  it("-c (check)", _("-c", "pnpm dedupe --check"));
});
