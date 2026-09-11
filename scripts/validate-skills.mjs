#!/usr/bin/env node
// Validate the skill files and the plugin manifest. Zero dependencies.
//   node scripts/validate-skills.mjs
// Exit 1 on any error.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// --- tiny YAML-frontmatter reader (only needs top-level `key: value`) ---
function frontmatter(text) {
	const m = text.match(/^---\n([\s\S]*?)\n---/);
	if (!m) return null;
	const out = {};
	for (const line of m[1].split("\n")) {
		const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
	}
	return out;
}

// --- walk skills/<category>/<name>/SKILL.md ---
const names = new Map(); // name -> "category/name"
const skillDirs = []; // "category/name"

for (const category of readdirSync(SKILLS)) {
	const catPath = join(SKILLS, category);
	if (!statSync(catPath).isDirectory()) continue;

	if (!existsSync(join(catPath, "README.md"))) warn(`skills/${category}/ has no README.md`);

	for (const name of readdirSync(catPath)) {
		const namedir = join(catPath, name);
		if (name === "README.md" || !statSync(namedir).isDirectory()) continue;

		const skillFile = join(namedir, "SKILL.md");
		const id = `${category}/${name}`;
		skillDirs.push(id);

		if (!existsSync(skillFile)) {
			err(`${id}/ has no SKILL.md`);
			continue;
		}
		const fm = frontmatter(readFileSync(skillFile, "utf8"));
		if (!fm) {
			err(`${id}/SKILL.md — no YAML frontmatter`);
			continue;
		}
		if (!fm.name) err(`${id}/SKILL.md — missing \`name\``);
		if (!fm.description) err(`${id}/SKILL.md — missing \`description\``);
		if (fm.name && fm.name !== name) err(`${id}/SKILL.md — \`name: ${fm.name}\` ≠ folder \`${name}\``);
		if (fm.description && !/\bUse\b/i.test(fm.description))
			warn(`${id}/SKILL.md — description has no "Use …" trigger clause`);

		const key = fm.name || name;
		if (names.has(key)) err(`duplicate skill name \`${key}\`: ${names.get(key)} and ${id}`);
		else names.set(key, id);
	}
}

// --- plugin manifest ---
const pluginPath = join(ROOT, ".claude-plugin", "plugin.json");
if (!existsSync(pluginPath)) {
	err(".claude-plugin/plugin.json is missing");
} else {
	let plugin;
	try {
		plugin = JSON.parse(readFileSync(pluginPath, "utf8"));
	} catch (e) {
		err(`.claude-plugin/plugin.json — invalid JSON: ${e.message}`);
	}
	if (plugin) {
		if (!plugin.name) err("plugin.json — missing `name`");
		if (!plugin.version) warn("plugin.json — no `version` (users won't get updates)");
		const listed = new Set((plugin.skills || []).map((s) => s.replace(/^\.\/skills\//, "")));
		const actual = new Set(skillDirs);
		for (const id of actual) if (!listed.has(id)) err(`plugin.json \`skills\` is missing ./skills/${id}`);
		for (const id of listed) if (!actual.has(id)) err(`plugin.json \`skills\` lists ./skills/${id} which does not exist`);
	}
}

for (const f of [".claude-plugin/marketplace.json", ".mcp.json"]) {
	const p = join(ROOT, f);
	if (!existsSync(p)) {
		err(`${f} is missing`);
		continue;
	}
	try {
		JSON.parse(readFileSync(p, "utf8"));
	} catch (e) {
		err(`${f} — invalid JSON: ${e.message}`);
	}
}

// --- report ---
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(
	`\n${skillDirs.length} skills · ${warnings.length} warnings · ${errors.length} errors`,
);
process.exit(errors.length ? 1 : 0);
