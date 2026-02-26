import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNa } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNa(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("na - pnpm", () => {
  it("passthrough", _("foo", "pnpm foo"));
  it("passthrough with args", _("run build --watch", "pnpm run build --watch"));
});
