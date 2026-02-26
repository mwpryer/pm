import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNr } from "@/parse";

const agent = "npm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNr(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nr - npm", () => {
  it("empty (defaults to start)", _("", "npm run start"));
  it("single script", _("dev", "npm run dev"));
  it(
    "with extra args (injects --)",
    _("build --watch", "npm run build -- --watch"),
  );
  it(
    "with multiple extra args",
    _("build --watch -o", "npm run build -- --watch -o"),
  );
  it("--if-present", _("test --if-present", "npm run --if-present test"));
  it(
    "--if-present with extra args",
    _(
      "test --if-present --coverage",
      "npm run --if-present test -- --coverage",
    ),
  );
});
