import { asset } from "@/lib/asset";

export function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
	return (
		// biome-ignore lint/performance/noImgElement: static export, tiny inline SVG, no optimization needed
		<img
			src={asset("/logo.svg")}
			alt="Workbench logo"
			width={size}
			height={size}
			className={`inline-block shrink-0 dark:invert ${className}`}
		/>
	);
}
