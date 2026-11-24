import type { ReactNode } from "react";

// The pixel font isn't monospaced, so code and ASCII trees drift out of line. Each character goes
// in a fixed-width cell instead (x-c, x-w for a wide glyph, x-s for a run of spaces; styled in
// globals.css). The text content is unchanged, so copying still gives the plain code.
// Same approach as tn10's rehypeCodeGrid.
const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });
const WIDE = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

export function GridText({ text }: { text: string }) {
	const cells: ReactNode[] = [];
	let spaces = 0;
	let key = 0;

	const flushSpaces = () => {
		if (spaces === 1) cells.push(<x-c key={key++}> </x-c>);
		if (spaces > 1)
			cells.push(
				<x-s key={key++} style={{ "--n": spaces } as React.CSSProperties}>
					{" ".repeat(spaces)}
				</x-s>
			);
		spaces = 0;
	};

	for (const { segment } of graphemes.segment(text)) {
		if (segment === " ") {
			spaces++;
			continue;
		}
		flushSpaces();
		if (segment === "\n") cells.push("\n");
		else if (WIDE.test(segment)) cells.push(<x-w key={key++}>{segment}</x-w>);
		else cells.push(<x-c key={key++}>{segment}</x-c>);
	}
	flushSpaces();

	return <>{cells}</>;
}

type CellProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"x-c": CellProps;
			"x-w": CellProps;
			"x-s": CellProps;
		}
	}
}
