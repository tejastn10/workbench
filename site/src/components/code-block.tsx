import { CopyButton } from "@/components/copy-button";
import { GridText } from "@/components/grid-text";

export function CodeBlock({ code }: { code: string }) {
	return (
		<div className="relative">
			<CopyButton text={code} />
			<pre>
				<code>
					<GridText text={code} />
				</code>
			</pre>
		</div>
	);
}
