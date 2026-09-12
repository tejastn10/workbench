import { CopyButton } from "@/components/copy-button";

export function CodeBlock({ code }: { code: string }) {
	return (
		<div className="relative">
			<CopyButton text={code} />
			<pre>
				<code>{code}</code>
			</pre>
		</div>
	);
}
