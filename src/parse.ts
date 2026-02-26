import { getCommand } from "@/commands";
import type { Agent, ResolvedCommand, Runner, RunnerContext } from "@/types";
import { exclude } from "@/utils";

// ni - install / add / global / frozen
export const parseNi: Runner = (
  agent: Agent,
  args: string[],
  ctx?: RunnerContext,
): ResolvedCommand | undefined => {
  // Handle global flag
  if (args.includes("-g")) {
    return getCommand(agent, "global", exclude(args, "-g"));
  }

  // Handle frozen lockfile
  if (args.includes("--frozen")) {
    return getCommand(agent, "frozen", exclude(args, "--frozen"));
  }

  // Handle frozen-if-present: use frozen if lockfile exists, else install
  if (args.includes("--frozen-if-present")) {
    const cleaned = exclude(args, "--frozen-if-present");
    if (ctx?.hasLock) {
      return getCommand(agent, "frozen", cleaned);
    }
    return getCommand(agent, "install", cleaned);
  }

  // Remap -D for bun (-D -> -d)
  let remapped = [...args];
  if (agent === "bun" && remapped.includes("-D")) {
    remapped = remapped.map((a) => (a === "-D" ? "-d" : a));
  }

  // Remap -P (production)
  if (remapped.includes("-P")) {
    const cleaned = exclude(remapped, "-P");
    if (agent === "npm") {
      return getCommand(agent, "install", [...cleaned, "--omit=dev"]);
    }
    return getCommand(agent, "install", [...cleaned, "--production"]);
  }

  // Has package names -> add, otherwise -> install
  const hasPackages = remapped.some((a) => !a.startsWith("-"));
  if (hasPackages) {
    return getCommand(agent, "add", remapped);
  }

  return getCommand(agent, "install", remapped);
};

// nr - run scripts
export const parseNr: Runner = (
  agent: Agent,
  args: string[],
  _ctx?: RunnerContext,
): ResolvedCommand | undefined => {
  // Default to "start" when no args
  let parsed = args.length === 0 ? ["start"] : [...args];

  // Handle --if-present: strip it and re-inject after "run"
  let ifPresent = false;
  if (parsed.includes("--if-present")) {
    ifPresent = true;
    parsed = exclude(parsed, "--if-present");
  }

  // For npm, inject -- separator when extra args follow the script name
  if (agent === "npm" && parsed.length > 1) {
    const [script = "", ...rest] = parsed;
    const final = ifPresent
      ? ["--if-present", script, "--", ...rest]
      : [script, "--", ...rest];
    return getCommand(agent, "run", final);
  }

  if (ifPresent) {
    parsed = ["--if-present", ...parsed];
  }

  return getCommand(agent, "run", parsed);
};

// nlx - execute package
export const parseNlx: Runner = (
  agent: Agent,
  args: string[],
): ResolvedCommand | undefined => {
  return getCommand(agent, "execute", args);
};

// nun - uninstall
export const parseNun: Runner = (
  agent: Agent,
  args: string[],
): ResolvedCommand | undefined => {
  if (args.includes("-g")) {
    return getCommand(agent, "global_uninstall", exclude(args, "-g"));
  }

  return getCommand(agent, "uninstall", args);
};

// nci - clean install (frozen-if-present)
export const parseNci: Runner = (
  agent: Agent,
  args: string[],
  ctx?: RunnerContext,
): ResolvedCommand | undefined => {
  return parseNi(agent, [...args, "--frozen-if-present"], ctx);
};

// nup - upgrade
export const parseNup: Runner = (
  agent: Agent,
  args: string[],
): ResolvedCommand | undefined => {
  if (args.includes("-i")) {
    return getCommand(agent, "upgrade-interactive", exclude(args, "-i"));
  }

  return getCommand(agent, "upgrade", args);
};

// nd - dedupe
export const parseNd: Runner = (
  agent: Agent,
  args: string[],
): ResolvedCommand | undefined => {
  // Remap -c flag per agent
  if (args.includes("-c")) {
    const cleaned = exclude(args, "-c");
    if (agent === "npm") {
      return getCommand(agent, "dedupe", [...cleaned, "--dry-run"]);
    }
    if (agent === "pnpm") {
      return getCommand(agent, "dedupe", [...cleaned, "--check"]);
    }
  }

  return getCommand(agent, "dedupe", args);
};

// na - agent passthrough
export const parseNa: Runner = (
  agent: Agent,
  args: string[],
): ResolvedCommand | undefined => {
  return getCommand(agent, "agent", args);
};
