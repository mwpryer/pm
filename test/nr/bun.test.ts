import { describe, expect, it } from "bun:test";
import { serializeCommand } from "@/commands";
import { parseNr } from "@/parse";

const agent = "bun" as const;

function _(args: string, expected: string) {
  return () => {
    expect(
      serializeCommand(parseNr(agent, args.split(" ").filter(Boolean))),
    ).toBe(expected);
  };
}

describe("nr - bun", () => {
  it("empty (defaults to start)", _("", "bun run start"));
  it("single script", _("dev", "bun run dev"));
  it(
    "with extra args (no separator)",
    _("build --watch", "bun run build --watch"),
  );
  it("--if-present", _("test --if-present", "bun run --if-present test"));
});
