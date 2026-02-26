import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNlx } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNlx(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nlx - pnpm", () => {
  it("single package", _("esbuild", "pnpm dlx esbuild"));
  it("with args", _("esbuild --bundle", "pnpm dlx esbuild --bundle"));
});
