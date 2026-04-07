import { $ } from "bun";

const BUMP_TYPES = ["patch", "minor", "major"] as const;
type BumpType = (typeof BUMP_TYPES)[number];

const bump = process.argv[2] as BumpType;
if (!BUMP_TYPES.includes(bump)) {
  console.error(`Usage: bun run release <${BUMP_TYPES.join("|")}>`);
  process.exit(1);
}

const pkg = await Bun.file("package.json").json();
const [major, minor, patch] = pkg.version.split(".").map(Number);

const next =
  bump === "major"
    ? `${major + 1}.0.0`
    : bump === "minor"
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

pkg.version = next;
await Bun.write("package.json", JSON.stringify(pkg, null, 2) + "\n");

const tag = `v${next}`;
await $`git add package.json`;
await $`git commit -m ${"release: " + tag}`;
await $`git tag ${tag}`;
await $`git push --follow-tags`;
await $`gh release create ${tag} --generate-notes`;

console.log(`Released ${tag}`);
