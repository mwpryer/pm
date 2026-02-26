# pm

Unified CLI for npm, pnpm, and bun.

[![npm version](https://img.shields.io/npm/v/@mwp13/pm)](https://www.npmjs.com/package/@mwp13/pm)

## Why

Every package manager has its own CLI with different commands, flags, and quirks. Switching between projects means remembering which incantation to use.

**pm** detects your project's package manager and translates a single set of commands automatically, so you only need to learn one CLI.

## Install

```bash
npm i -g @mwp13/pm
```

## Commands

| Command | Description                         |
| ------- | ----------------------------------- |
| `ni`    | Install dependencies / add packages |
| `nr`    | Run scripts                         |
| `nun`   | Uninstall packages                  |
| `nci`   | Clean install (frozen lockfile)     |
| `nup`   | Upgrade packages                    |
| `nd`    | Deduplicate dependencies            |
| `nlx`   | Execute packages                    |
| `na`    | Agent passthrough                   |

### `ni` - install

| Usage          | npm                | pnpm                       | bun                             |
| -------------- | ------------------ | -------------------------- | ------------------------------- |
| `ni`           | `npm i`            | `pnpm i`                   | `bun install`                   |
| `ni zod`       | `npm i zod`        | `pnpm add zod`             | `bun add zod`                   |
| `ni -D vitest` | `npm i -D vitest`  | `pnpm add -D vitest`       | `bun add -d vitest`             |
| `ni -g tsx`    | `npm i -g tsx`     | `pnpm add -g tsx`          | `bun add -g tsx`                |
| `ni --frozen`  | `npm ci`           | `pnpm i --frozen-lockfile` | `bun install --frozen-lockfile` |
| `ni -P`        | `npm i --omit=dev` | `pnpm i --production`      | `bun install --production`      |

### `nr` - run

| Usage                | npm                          | pnpm                       | bun                       |
| -------------------- | ---------------------------- | -------------------------- | ------------------------- |
| `nr`                 | `npm run start`              | `pnpm run start`           | `bun run start`           |
| `nr dev`             | `npm run dev`                | `pnpm run dev`             | `bun run dev`             |
| `nr dev --port 3000` | `npm run dev -- --port 3000` | `pnpm run dev --port 3000` | `bun run dev --port 3000` |
| `nr -`               | Rerun last script            |                            |                           |

### `nun` - uninstall

| Usage        | npm                    | pnpm                       | bun                 |
| ------------ | ---------------------- | -------------------------- | ------------------- |
| `nun zod`    | `npm uninstall zod`    | `pnpm remove zod`          | `bun remove zod`    |
| `nun -g tsx` | `npm uninstall -g tsx` | `pnpm remove --global tsx` | `bun remove -g tsx` |

### `nci` - clean install

Runs a frozen install if a lockfile exists, otherwise falls back to a regular install.

| Usage | npm      | pnpm                       | bun                             |
| ----- | -------- | -------------------------- | ------------------------------- |
| `nci` | `npm ci` | `pnpm i --frozen-lockfile` | `bun install --frozen-lockfile` |

### `nup` - upgrade

| Usage     | npm              | pnpm              | bun              |
| --------- | ---------------- | ----------------- | ---------------- |
| `nup`     | `npm update`     | `pnpm update`     | `bun update`     |
| `nup zod` | `npm update zod` | `pnpm update zod` | `bun update zod` |
| `nup -i`  | N/A              | `pnpm update -i`  | `bun update -i`  |

### `nd` - dedupe

| Usage   | npm                    | pnpm                  | bun |
| ------- | ---------------------- | --------------------- | --- |
| `nd`    | `npm dedupe`           | `pnpm dedupe`         | N/A |
| `nd -c` | `npm dedupe --dry-run` | `pnpm dedupe --check` | N/A |

### `nlx` - execute

| Usage        | npm          | pnpm              | bun            |
| ------------ | ------------ | ----------------- | -------------- |
| `nlx vitest` | `npx vitest` | `pnpm dlx vitest` | `bun x vitest` |

### `na` - agent

Passes arguments directly to the detected package manager.

| Usage           | npm              | pnpm              | bun              |
| --------------- | ---------------- | ----------------- | ---------------- |
| `na info react` | `npm info react` | `pnpm info react` | `bun info react` |

## Detection

pm detects the package manager in the following order:

1. **Lockfiles** (highest priority) - `bun.lock` / `bun.lockb`, `pnpm-lock.yaml` / `pnpm-workspace.yaml`, `package-lock.json`
2. **`packageManager` field** in `package.json`
3. **Config default** - falls back to `defaultAgent` from config

## Configuration

Config file: `~/.pmrc.json`

```json
{
  "defaultAgent": "npm",
  "globalAgent": "npm"
}
```

| Option         | Description                     | Default |
| -------------- | ------------------------------- | ------- |
| `defaultAgent` | Fallback when no PM is detected | `npm`   |
| `globalAgent`  | PM used for `-g` operations     | `npm`   |

### Environment variables

| Variable           | Description              |
| ------------------ | ------------------------ |
| `PM_DEFAULT_AGENT` | Overrides `defaultAgent` |
| `PM_GLOBAL_AGENT`  | Overrides `globalAgent`  |
| `PM_CONFIG_FILE`   | Custom config file path  |

Environment variables take priority over the config file.

## Additional features

- **Debug mode** - append `?` to any command to print it without executing: `ni zod ?`
- **Directory override** - use `-C <dir>` to run in a different directory: `ni -C packages/core`
- **Rerun** - `nr -` reruns the last script

## Credits

Inspired by [@antfu/ni](https://github.com/antfu-collective/ni).

## Licence

[MIT](LICENSE)
