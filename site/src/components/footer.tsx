import { EXTERNAL, SITE } from "@/data/site";

export function Footer() {
	return (
		<footer className="mx-auto mt-10 max-w-6xl border-t border-border px-5 py-10 text-xs text-muted-foreground">
			<p>
				MIT ·{" "}
				<a href={SITE.repo} className="underline-slide text-foreground">
					github.com/tejastn10/workbench
				</a>{" "}
				· built by{" "}
				<a href={SITE.authorUrl} className="underline-slide text-foreground">
					{SITE.author}
				</a>
			</p>
			<p className="mt-1">
				Some skills adapted from{" "}
				<a href={EXTERNAL.repo} className="underline-slide text-foreground">
					mattpocock/skills
				</a>{" "}
				(MIT).
			</p>
		</footer>
	);
}
