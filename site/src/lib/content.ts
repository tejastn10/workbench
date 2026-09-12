import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

// The site lives in <repo>/site, so the repo root is one level up.
const REPO_ROOT = join(process.cwd(), "..");

export type Skill = {
	name: string;
	category: string;
	file: string; // repo-relative path, e.g. "skills/data/redis-patterns.md"
	blurb: string;
	description: string;
	adaptedFrom?: string;
};

export type SkillGroup = { category: string; label: string; skills: Skill[] };
export type Template = { file: string; title: string; purpose: string };
export type McpServer = { name: string; purpose: string; auth: string; doc: string };

// Preferred ordering for known categories. Anything not listed is auto-discovered
// and appended alphabetically — adding a category needs no change here.
const CATEGORY_ORDER = [
	"workflows",
	"planning",
	"design",
	"pr-review",
	"quality",
	"data",
	"queues",
	"observability",
	"deployment",
	"incident",
	"security",
	"meta",
];

const ACRONYMS = new Set(["pr", "ci", "cd", "api", "mcp", "sdk", "ui", "ux", "sql"]);

function labelFor(slug: string): string {
	return slug
		.split("-")
		.map((word, i) =>
			ACRONYMS.has(word)
				? word.toUpperCase()
				: i === 0
					? word.charAt(0).toUpperCase() + word.slice(1)
					: word
		)
		.join(" ");
}

// Read "Adapted from [<source>](…)" out of a skill body so the badge needs no
// hand-maintained list. mattpocock/skills → "Matt Pocock".
function adaptedFrom(body: string): string | undefined {
	// Only when the skill itself is an adaptation — its attribution line starts
	// "Adapted from [<source>]". "Pattern adapted from …" (a borrowed idea) doesn't count.
	const m = body.match(/^Adapted from\s+\[([^\]]+)\]/im);
	if (!m) return undefined;
	const src = m[1].trim();
	return /mattpocock/i.test(src) ? "Matt Pocock" : src;
}

// Trim the long frontmatter description down to a one-line card blurb: drop the
// "Use when …" trigger clause, then keep just the first sentence.
function toBlurb(description: string): string {
	const cut = description.search(/\s+Use (when|it|this|as|to)\b/i);
	let head = (cut > 0 ? description.slice(0, cut) : description).trim();
	const period = head.search(/\.\s+[A-Z(]/);
	if (period > 60) head = head.slice(0, period);
	return head.replace(/[.;]\s*$/, "");
}

export function getSkills(): SkillGroup[] {
	const skillsDir = join(REPO_ROOT, "skills");
	const groups = new Map<string, Skill[]>();

	for (const category of readdirSync(skillsDir)) {
		const catPath = join(skillsDir, category);
		if (!statSync(catPath).isDirectory()) continue;

		// each skill is a directory containing SKILL.md (Claude Code plugin format)
		for (const entry of readdirSync(catPath)) {
			const skillFile = join(catPath, entry, "SKILL.md");
			if (entry === "README.md" || !statSync(join(catPath, entry)).isDirectory()) continue;
			let raw: string;
			try {
				raw = readFileSync(skillFile, "utf8");
			} catch {
				continue;
			}
			const { data, content } = matter(raw);
			if (!data.name || !data.description) continue;
			const list = groups.get(category) ?? [];
			list.push({
				name: data.name,
				category,
				file: `skills/${category}/${entry}/SKILL.md`,
				description: data.description,
				blurb: toBlurb(data.description),
				adaptedFrom: adaptedFrom(content),
			});
			groups.set(category, list);
		}
	}

	const known = CATEGORY_ORDER.filter((c) => groups.has(c));
	const rest = [...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort();

	return [...known, ...rest].map((category) => ({
		category,
		label: labelFor(category),
		skills: (groups.get(category) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
	}));
}

export function getSkillCount(): number {
	return getSkills().reduce((n, g) => n + g.skills.length, 0);
}

// Purpose strings come from the templates README table — its single source of truth.
function templatePurposes(): Record<string, string> {
	const readme = join(REPO_ROOT, "docs", "templates", "README.md");
	const out: Record<string, string> = {};
	for (const line of readFileSync(readme, "utf8").split("\n")) {
		const m = line.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/);
		if (m) out[m[1]] = m[2];
	}
	return out;
}

export function getTemplates(): Template[] {
	const dir = join(REPO_ROOT, "docs", "templates");
	const purposes = templatePurposes();
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md") && f !== "README.md")
		.sort()
		.map((file) => {
			const first = readFileSync(join(dir, file), "utf8")
				.split("\n")
				.find((l) => l.startsWith("# "));
			return {
				file,
				title: first ? first.replace(/^#\s+/, "") : file,
				purpose: purposes[file] ?? "",
			};
		});
}

export function getMcpServers(): McpServer[] {
	return [
		{
			name: "Context7",
			purpose: "Live, version-pinned library docs — the long tail",
			auth: "none (optional key)",
			doc: ".agents/mcp/context7.md",
		},
		{
			name: "DeepWiki",
			purpose: "Auto-generated architecture docs for any public GitHub repo",
			auth: "none",
			doc: ".agents/mcp/deepwiki.md",
		},
		{
			name: "GitHub",
			purpose: "PR / issue / release history — via the gh CLI, not an MCP server",
			auth: "gh (already authed)",
			doc: ".agents/github-cli.md",
		},
	];
}
