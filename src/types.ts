export type Agent = "npm" | "pnpm" | "bun";

export type Command =
  | "install"
  | "add"
  | "uninstall"
  | "global"
  | "global_uninstall"
  | "upgrade"
  | "upgrade-interactive"
  | "run"
  | "execute"
  | "frozen"
  | "dedupe"
  | "agent"
  | "agent_run";

export interface ResolvedCommand {
  command: string;
  args: string[];
}

export interface RunnerContext {
  programmatic?: boolean;
  hasLock?: boolean;
  cwd?: string;
}

export interface Config {
  defaultAgent: Agent;
  globalAgent: Agent;
}

export type Runner = (
  agent: Agent,
  args: string[],
  ctx?: RunnerContext,
) => ResolvedCommand | undefined;
