import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNlx } from "@/parse";

const agent = "bun" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNlx(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nlx - bun", () => {
  it("single package", _("esbuild", "bun x esbuild"));
  it("with args", _("esbuild --bundle", "bun x esbuild --bundle"));
});
