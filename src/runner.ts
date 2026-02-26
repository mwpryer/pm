import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { serializeCommand } from "@/commands";
import { getConfig, getGlobalAgent } from "@/config";
import { detect } from "@/detect";
import type { Agent, ResolvedCommand, Runner, RunnerContext } from "@/types";
import { cmdExists, exclude } from "@/utils";

interface RunOptions {
  programmatic?: boolean;
}

// Main entry point for CLI commands
export async function runCli(
  fn: Runner,
  options: RunOptions = {},
): Promise<void> {
  const args = process.argv.slice(2);
  return run(fn, args, options);
}

// Full run pipeline: parse flags, detect agent, resolve + execute
export async function run(
  fn: Runner,
  rawArgs: string[],
  options: RunOptions = {},
): Promise<void> {
  // Strip debug flag
  const debugIdx = rawArgs.indexOf("?");
  const debug = debugIdx !== -1;
  let args = debug ? exclude(rawArgs, "?") : [...rawArgs];

  // Handle -C <dir> cwd override
  let cwd = process.cwd();
  const cwdIdx = args.indexOf("-C");
  const cwdArg = args[cwdIdx + 1];
  if (cwdIdx !== -1 && cwdArg) {
    cwd = path.resolve(cwdArg);
    args = [...args.slice(0, cwdIdx), ...args.slice(cwdIdx + 2)];
  }

  // Handle --version / -v
  if (args.includes("-v") || args.includes("--version")) {
    console.log(`pm v${__PM_VERSION__}`);
    return;
  }

  // Handle --help / -h
  if (args.includes("-h") || args.includes("--help")) {
    console.log("pm - unified CLI for npm, pnpm, and bun");
    console.log("\nUsage: <command> [args...] [?]");
    console.log("\nGlobal flags:");
    console.log("  ?          Debug mode - print command without executing");
    console.log("  -C <dir>   Run in a different directory");
    console.log("  -v         Show version");
    console.log("  -h         Show help");
    return;
  }

  const resolved = await getCliCommand(fn, args, options, cwd);
  if (!resolved) return;

  if (debug) {
    console.log(serializeCommand(resolved));
    return;
  }

  await execute(resolved, cwd);
}

// Detects agent, calls parser, returns resolved command
export async function getCliCommand(
  fn: Runner,
  args: string[],
  options: RunOptions,
  cwd: string,
): Promise<ResolvedCommand | undefined> {
  let agent: Agent;

  // -g flag routes to globalAgent
  if (args.includes("-g")) {
    agent = getGlobalAgent();
  } else {
    const detected = detect(cwd);
    if (detected) {
      agent = detected;
    } else {
      agent = getConfig().defaultAgent;
    }

    // Check if PM binary exists
    if (!options.programmatic && !cmdExists(agent)) {
      console.error(`${agent} is not installed. Run: npm i -g ${agent}`);
      process.exit(1);
    }
  }

  const ctx: RunnerContext = {
    programmatic: options.programmatic,
    hasLock: hasLockfile(cwd),
    cwd,
  };

  return fn(agent, args, ctx);
}

// Spawns process with inherited stdio and forwards exit code
function execute(resolved: ResolvedCommand, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(resolved.command, resolved.args, {
      stdio: "inherit",
      cwd,
    });

    // Forward SIGINT to child
    function onSigint() {
      child.kill("SIGINT");
    }
    process.on("SIGINT", onSigint);

    child.on("close", (code) => {
      process.off("SIGINT", onSigint);
      if (code !== 0) {
        process.exit(code ?? 1);
      }
      resolve();
    });

    child.on("error", (err) => {
      process.off("SIGINT", onSigint);
      reject(err);
    });
  });
}

function hasLockfile(cwd: string): boolean {
  const lockfiles = [
    "bun.lock",
    "bun.lockb",
    "pnpm-lock.yaml",
    "package-lock.json",
  ];
  return lockfiles.some((f) => fs.existsSync(path.join(cwd, f)));
}
