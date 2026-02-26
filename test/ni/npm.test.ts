import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNi } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNi(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("ni - npm", () => {
  it("empty", _("", "npm i"));
  it("add single", _("axios", "npm i axios"));
  it("add multiple", _("axios lodash", "npm i axios lodash"));
  it("add -D", _("eslint -D", "npm i eslint -D"));
  it("global", _("-g eslint", "npm i -g eslint"));
  it("frozen", _("--frozen", "npm ci"));
  it("-P (production)", _("-P", "npm i --omit=dev"));

  it("--frozen-if-present with lockfile", () => {
    expect(
      serializeCommand(
        parseNi(agent, ["--frozen-if-present"], { hasLock: true }),
      ),
    ).toBe("npm ci");
  });

  it("--frozen-if-present without lockfile", () => {
    expect(
      serializeCommand(
        parseNi(agent, ["--frozen-if-present"], { hasLock: false }),
      ),
    ).toBe("npm i");
  });
});
