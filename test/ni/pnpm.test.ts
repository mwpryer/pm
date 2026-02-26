import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNi } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNi(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("ni - pnpm", () => {
  it("empty", _("", "pnpm i"));
  it("add single", _("axios", "pnpm add axios"));
  it("add multiple", _("axios lodash", "pnpm add axios lodash"));
  it("add -D", _("-D eslint", "pnpm add -D eslint"));
  it("global", _("-g eslint", "pnpm add -g eslint"));
  it("frozen", _("--frozen", "pnpm i --frozen-lockfile"));
  it("-P (production)", _("-P", "pnpm i --production"));

  it("--frozen-if-present with lockfile", () => {
    expect(
      serializeCommand(
        parseNi(agent, ["--frozen-if-present"], { hasLock: true }),
      ),
    ).toBe("pnpm i --frozen-lockfile");
  });

  it("--frozen-if-present without lockfile", () => {
    expect(
      serializeCommand(
        parseNi(agent, ["--frozen-if-present"], { hasLock: false }),
      ),
    ).toBe("pnpm i");
  });
});
