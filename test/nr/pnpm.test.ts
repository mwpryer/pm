import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNr } from "@/parse";

const agent = "pnpm" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNr(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nr - pnpm", () => {
  it("empty (defaults to start)", _("", "pnpm run start"));
  it("single script", _("dev", "pnpm run dev"));
  it(
    "with extra args (no separator)",
    _("build --watch", "pnpm run build --watch"),
  );
  it("--if-present", _("test --if-present", "pnpm run --if-present test"));
  it("-w (filter to package)", _("dev -w ui", "pnpm --filter ui run dev"));
  it("-r (all packages)", _("build -r", "pnpm -r run build"));
});
