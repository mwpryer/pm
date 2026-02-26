import { parseNr } from "@/parse";
import { runCli } from "@/runner";
import { loadStorage, saveStorage } from "@/storage";

function main(): Promise<void> {
  const args = process.argv.slice(2);

  // nr - → rerun last command
  if (args.length === 1 && args[0] === "-") {
    const storage = loadStorage();
    if (storage.lastRunCommand) {
      process.argv = [...process.argv.slice(0, 2), storage.lastRunCommand];
    } else {
      console.error("No previous command to rerun");
      process.exit(1);
    }
  }

  // Save last-run command
  const finalArgs = process.argv.slice(2);
  if (finalArgs.length > 0 && finalArgs[0] !== "-") {
    saveStorage({ lastRunCommand: finalArgs[0] });
  }

  return runCli(parseNr);
}

main();
