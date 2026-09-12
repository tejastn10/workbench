"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard?.writeText(text).then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 1400);
				});
			}}
			className="absolute right-2 top-2 cursor-pointer border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
		>
			{copied ? "copied" : "copy"}
		</button>
	);
}
