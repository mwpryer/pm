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
    execute: "npx {0}",
    frozen: "npm ci",
    dedupe: "npm dedupe",
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
    execute: "pnpm dlx {0}",
    frozen: "pnpm i --frozen-lockfile",
    dedupe: "pnpm dedupe",
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
    execute: "bun x {0}",
    frozen: "bun install --frozen-lockfile",
    dedupe: null,
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

// Splits template on {0}, returns command + args
export function constructCommand(
  template: string,
  args: string[],
): ResolvedCommand {
  const [command = "", ...rest] = template.split(" ");
  const idx = rest.indexOf("{0}");

  if (idx === -1) {
    return { command, args: [...rest, ...args] };
  }

  return {
    command,
    args: [...rest.slice(0, idx), ...args, ...rest.slice(idx + 1)],
  };
}

// Returns template or throws UnsupportedCommand for null entries
export function getCommand(
  agent: Agent,
  command: Command,
  args: string[] = [],
): ResolvedCommand {
  const template = COMMANDS[agent][command];

  if (template === null) {
    throw new UnsupportedCommand(agent, command);
  }

  return constructCommand(template, args);
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
