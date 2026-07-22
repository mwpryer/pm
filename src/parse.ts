import { getCommand } from "@/commands";
import { resolveWorkspaceDir } from "@/monorepo";
import type { Agent, ResolvedCommand, Runner, RunnerContext } from "@/types";
import { exclude, extractFlag } from "@/utils";

function extractWorkspace(args: string[]): { pkg?: string; rest: string[] } {
  const { found, value: pkg, rest } = extractFlag(args, "-w");
  if (!found) return { rest: args };
  if (!pkg || pkg.startsWith("-")) {
    throw new Error("Missing package name after -w");
  }

  return { pkg, rest };
}

// bun targets a workspace by directory (--cwd); npm/pnpm use the name
function workspaceTarget(agent: Agent, pkg: string, cwd?: string): string {
  return agent === "bun" ? resolveWorkspaceDir(pkg, cwd) : pkg;
}

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

  // -w <pkg>: add to a specific workspace package
  const ws = extractWorkspace(remapped);
  if (ws.pkg) {
    if (!ws.rest.some((a) => !a.startsWith("-"))) {
      throw new Error("ni -w requires a package to add");
    }
    return getCommand(
      agent,
      "add-filter",
      ws.rest,
      workspaceTarget(agent, ws.pkg, ctx?.cwd),
    );
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

// Builds the run payload, inserting npm's "--" separator before extra args
function buildRunPayload(
  parsed: string[],
  ifPresent: boolean,
  agent: Agent,
): string[] {
  if (agent === "npm" && parsed.length > 1) {
    const [script = "", ...rest] = parsed;
    return ifPresent
      ? ["--if-present", script, "--", ...rest]
      : [script, "--", ...rest];
  }
  return ifPresent ? ["--if-present", ...parsed] : parsed;
}

// nr - run (-w one package, -r all packages)
export const parseNr: Runner = (
  agent: Agent,
  args: string[],
  _ctx?: RunnerContext,
): ResolvedCommand | undefined => {
  const recursive = args.includes("-r") || args.includes("--recursive");
  const { pkg, rest } = extractWorkspace(exclude(args, "-r", "--recursive"));
  if (recursive && pkg) throw new Error("Cannot combine -w and -r");

  // Default to "start" when no script given
  let parsed = rest.length === 0 ? ["start"] : [...rest];

  let ifPresent = false;
  if (parsed.includes("--if-present")) {
    ifPresent = true;
    parsed = exclude(parsed, "--if-present");
  }

  // Recursive runs skip packages missing the script, so --if-present is implicit
  const payload = buildRunPayload(parsed, !recursive && ifPresent, agent);

  if (recursive) return getCommand(agent, "run-all", payload);
  if (pkg) return getCommand(agent, "run-filter", payload, pkg);
  return getCommand(agent, "run", payload);
};

// nlx - execute package
export const parseNlx: Runner = (
  agent: Agent,
  args: string[],
): ResolvedCommand | undefined => {
  return getCommand(agent, "execute", args);
};

// nun - uninstall (-w from one package)
export const parseNun: Runner = (
  agent: Agent,
  args: string[],
  ctx?: RunnerContext,
): ResolvedCommand | undefined => {
  if (args.includes("-g")) {
    return getCommand(agent, "global_uninstall", exclude(args, "-g"));
  }

  const ws = extractWorkspace(args);
  if (ws.pkg) {
    if (!ws.rest.some((a) => !a.startsWith("-"))) {
      throw new Error("nun -w requires a package to remove");
    }
    return getCommand(
      agent,
      "uninstall-filter",
      ws.rest,
      workspaceTarget(agent, ws.pkg, ctx?.cwd),
    );
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

// ndd - dedupe
export const parseNdd: Runner = (
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
