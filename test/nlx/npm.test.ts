import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNlx } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNlx(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nlx - npm", () => {
  it("single package", _("esbuild", "npx esbuild"));
  it("with args", _("esbuild --bundle", "npx esbuild --bundle"));
});
