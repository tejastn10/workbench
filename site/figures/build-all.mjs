// Builds every page figure. The station runs first: it also writes the shared kit CSS.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIGURES = ["station", "cabinet", "sequencer", "stamps", "ground-station", "lock", "launch"];
const args = process.argv.slice(2);
for (const name of FIGURES) {
	const run = spawnSync(process.execPath, [join(HERE, name, "build.mjs"), ...args], { stdio: "inherit" });
	if (run.status !== 0) process.exit(run.status ?? 1);
}
