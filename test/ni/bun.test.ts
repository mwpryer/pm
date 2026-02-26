import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNi } from "@/parse";

const agent = "bun" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNi(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("ni - bun", () => {
  it("empty", _("", "bun install"));
  it("add single", _("axios", "bun add axios"));
  it("add multiple", _("axios lodash", "bun add axios lodash"));
  it("add -D (remaps to -d)", _("eslint -D", "bun add eslint -d"));
  it("global", _("-g eslint", "bun add -g eslint"));
  it("frozen", _("--frozen", "bun install --frozen-lockfile"));
  it("-P (production)", _("-P", "bun install --production"));

  it("--frozen-if-present with lockfile", () => {
    expect(
      serializeCommand(
        parseNi(agent, ["--frozen-if-present"], { hasLock: true }),
      ),
    ).toBe("bun install --frozen-lockfile");
  });

  it("--frozen-if-present without lockfile", () => {
    expect(
      serializeCommand(
        parseNi(agent, ["--frozen-if-present"], { hasLock: false }),
      ),
    ).toBe("bun install");
  });
});
