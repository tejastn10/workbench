import { EXTERNAL, SITE } from "@/data/site";

export function Footer() {
	return (
		<footer className="mx-auto mt-10 w-full max-w-[1800px] border-t border-border px-5 py-10 text-xs text-muted-foreground sm:px-8 lg:px-12 xl:px-16">
			<div className="mx-auto max-w-6xl">
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
					(MIT). Fig 1 drawn with{" "}
					<a
						href="https://github.com/wheresryan22/anatomy"
						className="underline-slide text-foreground"
					>
						anatomy
					</a>{" "}
					by Ryan (MIT); motion guided by{" "}
					<a
						href="https://github.com/lottiefiles/motion-design-skill"
						className="underline-slide text-foreground"
					>
						motion-design
					</a>{" "}
					by LottieFiles (MIT).
				</p>
				<p className="mt-1">
					<code>diagram</code> adapted from{" "}
					<a href="https://github.com/garrytan/gstack" className="underline-slide text-foreground">
						garrytan/gstack
					</a>{" "}
					by Garry Tan; <code>feynman-check</code> from{" "}
					<a
						href="https://github.com/haunguyendev/feynman-skill"
						className="underline-slide text-foreground"
					>
						feynman-skill
					</a>{" "}
					and{" "}
					<a
						href="https://github.com/Freya0525/supertutor-skill"
						className="underline-slide text-foreground"
					>
						supertutor-skill
					</a>{" "}
					(all MIT). <code>head-first</code> follows the Head First method of Kathy Sierra and Bert
					Bates.
				</p>
			</div>
		</footer>
	);
}
