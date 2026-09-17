// Animated nested-bracket marquee — a monochrome "code rain" texture for the hero.
// Purely decorative.

const UNIT = "<([{<([{<()>}])>}])> ";
const LINE = UNIT.repeat(48);

type Props = {
	rows?: number;
	className?: string;
	size?: string; // tailwind text-size class
	fill?: boolean; // spread rows evenly over the container's full height
};

export function BracketField({
	rows = 3,
	className = "",
	size = "text-[0.7rem]",
	fill = false,
}: Props) {
	return (
		<div
			aria-hidden
			className={`select-none overflow-hidden ${fill ? "flex h-full flex-col justify-between" : ""} ${className}`}
		>
			{Array.from({ length: rows }, (_, i) => (
				<div
					key={i}
					className={`bracket-row ${size} leading-[1.15] text-muted-foreground/30`}
					style={{
						animationDuration: `${22 + (i % 6) * 9}s`,
						animationDirection: i % 2 ? "reverse" : "normal",
					}}
				>
					{LINE}
					{LINE}
				</div>
			))}
		</div>
	);
}
