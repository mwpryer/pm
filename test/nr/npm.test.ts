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
  it("-w (filter to package)", _("dev -w ui", "npm run -w ui dev"));
  it(
    "-w with extra args",
    _("build --watch -w ui", "npm run -w ui build -- --watch"),
  );
  it(
    "-r (all packages)",
    _("build -r", "npm run --workspaces --if-present build"),
  );
  it("-w and -r together throws", () => {
    expect(() => parseNr(agent, ["build", "-r", "-w", "ui"])).toThrow();
  });
  it("-w without a package name throws", () => {
    expect(() => parseNr(agent, ["build", "-w"])).toThrow();
  });
  it("-w followed by a flag throws", () => {
    expect(() => parseNr(agent, ["build", "-w", "-D"])).toThrow();
  });
});
