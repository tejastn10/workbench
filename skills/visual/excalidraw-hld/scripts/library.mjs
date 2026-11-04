#!/usr/bin/env node
// Rebuild components.excalidrawlib from components.excalidraw. Zero dependencies.
//   node library.mjs
// One library item per hld tag (components, primitives, patterns), in sheet order.
// Run it after editing the sheet; import the .excalidrawlib in Excalidraw's library panel.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = join(dirname(fileURLToPath(import.meta.url)), "..");
const sheet = JSON.parse(readFileSync(join(HERE, "components.excalidraw"), "utf8"));

const items = new Map();
for (const e of sheet.elements) {
	const tag = e.customData?.hld;
	if (!tag) continue;
	if (!items.has(tag)) items.set(tag, []);
	items.get(tag).push(e);
}

const created = Date.now();
const libraryItems = [...items].map(([name, elements]) => ({
	id: `hld-${name.replace(/[^a-z0-9-]/g, "-")}`,
	status: "published",
	created,
	name: name.replace(/^pattern:/, "pattern · "),
	elements,
}));

writeFileSync(
	join(HERE, "components.excalidrawlib"),
	`${JSON.stringify({ type: "excalidrawlib", version: 2, source: "https://excalidraw.com", libraryItems }, null, "\t")}\n`,
);
console.log(`components.excalidrawlib: ${libraryItems.length} items`);
