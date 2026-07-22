import type { Agent, Command, ResolvedCommand } from "@/types";

// Template string where {0} is replaced with joined args
type CommandTemplate = string | null;

// Command lookup: agent -> command -> template
export const COMMANDS: Record<Agent, Record<Command, CommandTemplate>> = {
  npm: {
    install: "npm i",
    add: "npm i {0}",
    uninstall: "npm uninstall {0}",
    global: "npm i -g {0}",
    global_uninstall: "npm uninstall -g {0}",
    upgrade: "npm update {0}",
    "upgrade-interactive": null,
    run: "npm run {0}",
    // -w before {0} so it stays ahead of any "--" script-arg separator
    "run-filter": "npm run -w {pkg} {0}",
    "run-all": "npm run --workspaces --if-present {0}",
    execute: "npx {0}",
    frozen: "npm ci",
    dedupe: "npm dedupe",
    "add-filter": "npm i {0} -w {pkg}",
    "uninstall-filter": "npm uninstall {0} -w {pkg}",
    agent: "npm {0}",
    agent_run: "npm run {0}",
  },
  pnpm: {
    install: "pnpm i",
    add: "pnpm add {0}",
    uninstall: "pnpm remove {0}",
    global: "pnpm add -g {0}",
    global_uninstall: "pnpm remove --global {0}",
    upgrade: "pnpm update {0}",
    "upgrade-interactive": "pnpm update -i {0}",
    run: "pnpm run {0}",
    "run-filter": "pnpm --filter {pkg} run {0}",
    "run-all": "pnpm -r run {0}",
    execute: "pnpm dlx {0}",
    frozen: "pnpm i --frozen-lockfile",
    dedupe: "pnpm dedupe",
    "add-filter": "pnpm add {0} --filter {pkg}",
    "uninstall-filter": "pnpm remove {0} --filter {pkg}",
    agent: "pnpm {0}",
    agent_run: "pnpm run {0}",
  },
  bun: {
    install: "bun install",
    add: "bun add {0}",
    uninstall: "bun remove {0}",
    global: "bun add -g {0}",
    global_uninstall: "bun remove -g {0}",
    upgrade: "bun update {0}",
    "upgrade-interactive": "bun update -i {0}",
    run: "bun run {0}",
    "run-filter": "bun run --filter {pkg} {0}",
    "run-all": "bun run --workspaces {0}",
    execute: "bun x {0}",
    frozen: "bun install --frozen-lockfile",
    dedupe: null,
    // bun add/remove have no --filter, only --cwd, so {pkg} is a resolved dir
    "add-filter": "bun add {0} --cwd {pkg}",
    "uninstall-filter": "bun remove {0} --cwd {pkg}",
    agent: "bun {0}",
    agent_run: "bun run {0}",
  },
};

export class UnsupportedCommand extends Error {
  constructor(agent: Agent, command: Command) {
    super(`\`${command}\` is not supported by ${agent}`);
    this.name = "UnsupportedCommand";
  }
}

// Expands {0} (args) and {pkg} (workspace target); args are appended if no {0}
export function constructCommand(
  template: string,
  args: string[],
  pkg?: string,
): ResolvedCommand {
  // Token-level substitution so a {pkg} dir containing spaces stays one arg
  const tokens = template
    .split(" ")
    .flatMap((t) =>
      t === "{0}" ? args : t === "{pkg}" ? (pkg ? [pkg] : []) : [t],
    );
  if (!template.includes("{0}")) tokens.push(...args);

  const [command = "", ...rest] = tokens;
  return { command, args: rest };
}

// Returns template or throws UnsupportedCommand for null entries
export function getCommand(
  agent: Agent,
  command: Command,
  args: string[] = [],
  pkg?: string,
): ResolvedCommand {
  const template = COMMANDS[agent][command];

  if (template === null) {
    throw new UnsupportedCommand(agent, command);
  }

  return constructCommand(template, args, pkg);
}

// Returns a human-readable string for debug mode and tests
export function serializeCommand(
  resolved: ResolvedCommand | undefined,
): string {
  if (!resolved) return "";
  const { command, args } = resolved;
  if (args.length === 0) return command;
  return `${command} ${args.join(" ")}`;
}
