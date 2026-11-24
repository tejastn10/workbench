"use client";

import { type FC, useLayoutEffect, useRef } from "react";

type ShapeKind = "text" | "heading" | "image" | "icon" | "card" | "vector" | "fill";
type Rect = Pick<DOMRect, "top" | "left" | "width" | "height">;
// ? A bordered element's edges: per-side widths (top, right, bottom, left), whether they're
// ? dashed/dotted, and whether the element is a circle. Keycaps' thick bottom edge, a stamp's
// ? perforation and a jack's ring all come through
type Edge = { sides: [number, number, number, number]; broken: boolean; round: boolean };
// ? `cells` is a traced SVG as flat [cx, cy, ink] triples; `ink` is a filled block's shade
type Shape = { kind: ShapeKind; rect: Rect; edge?: Edge; cells?: number[]; ink?: number };

// ? Content is rasterised into PX-sized pixels; the background dissolves in TILE-sized blocks
const PX = 5;
const TILE = PX * 4;
// ? Timeline in seconds: pixels scan in until RESOLVE, then a diagonal wave dissolves everything
const SCAN = 0.55;
const RESOLVE = 0.85;
const WAVE = 0.5;
const FADE_IN = 0.14;
const FADE_OUT = 0.24;
const JITTER = 0.12;
const END = RESOLVE + WAVE + JITTER + FADE_OUT;

const MAX_LINES = 200;
const MAX_BOXES = 140;
const IGNORE = ".boot-intro, script, style, noscript";
const MEDIA = "img, video, canvas, picture";
const GEOMETRY = "path, circle, rect, ellipse, polygon, polyline, line";
// ? SVGs with more parts than this (the contribution skyline) are dithered, not traced
const MAX_TRACE_PARTS = 24;
// ? Sample points per cell, as fractions of PX: four per cell catches thin strokes
const SAMPLES = [0.25, 0.75];

const pick = (r: Rect): Rect => ({ top: r.top, left: r.left, width: r.width, height: r.height });

// ? Closed <details>, display:none, visibility:hidden and content-visibility all report false
const isShown = (el: Element | null | undefined): boolean =>
	Boolean(el) && (el?.checkVisibility?.({ visibilityProperty: true }) ?? true);

const inViewport = (r: Rect, vh: number): boolean =>
	r.width > 2 && r.height > 2 && r.top < vh && r.top + r.height > 0;

const intersect = (a: Rect, b: Rect): Rect => {
	const left = Math.max(a.left, b.left);
	const top = Math.max(a.top, b.top);
	const right = Math.min(a.left + a.width, b.left + b.width);
	const bottom = Math.min(a.top + a.height, b.top + b.height);
	return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
};

// ? Intersect with every ancestor that clips its overflow (marquees, scrollers), as the browser
// ? does when painting
const clipCache = new Map<Element, Rect | null>();
const clipBox = (el: Element | null): Rect | null => {
	if (!el || el === document.body) return null;
	if (clipCache.has(el)) return clipCache.get(el) ?? null;
	const style = getComputedStyle(el);
	const parent = clipBox(el.parentElement);
	let box = parent;
	if (style.overflowX !== "visible" || style.overflowY !== "visible") {
		const r = el.getBoundingClientRect();
		box = parent ? intersect(r, parent) : pick(r);
	}
	clipCache.set(el, box);
	return box;
};

const clipTo = (r: Rect, el: Element | null): Rect => {
	const box = clipBox(el);
	return box ? intersect(r, box) : pick(r);
};

// ? Join the line fragments of one text run (bold/links split a line into several rects)
const mergeLines = (rects: Rect[]): Rect[] => {
	const sorted = [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
	const merged: Rect[] = [];
	for (const r of sorted) {
		const last = merged.at(-1);
		// Sub-pixel top differences can sort a fragment before one to its left, so measure the
		// gap from whichever side it falls on
		const gap = last
			? Math.max(r.left - (last.left + last.width), last.left - (r.left + r.width))
			: 0;
		if (last && Math.abs(last.top - r.top) < 3 && gap < 10) {
			const left = Math.min(last.left, r.left);
			const right = Math.max(last.left + last.width, r.left + r.width);
			merged[merged.length - 1] = {
				top: last.top,
				left,
				width: right - left,
				height: Math.max(last.height, r.height),
			};
		} else {
			merged.push(pick(r));
		}
	}
	return merged;
};

// ? Trace an SVG's real outline into cells by testing points against each part's fill and
// ? stroke, so a logo keeps its shape instead of becoming a shaded square
const traceSvg = (svg: SVGSVGElement, r: Rect): number[] | null => {
	const parts = [...svg.querySelectorAll<SVGGeometryElement>(GEOMETRY)];
	if (parts.length === 0 || parts.length > MAX_TRACE_PARTS) return null;
	const tests = parts.flatMap((part) => {
		const inverse = part.getScreenCTM()?.inverse();
		if (!inverse) return [];
		const style = getComputedStyle(part);
		return [{ part, inverse, fill: style.fill !== "none", stroke: style.stroke !== "none" }];
	});
	const cells: number[] = [];
	const x0 = Math.floor(r.left / PX);
	const y0 = Math.floor(r.top / PX);
	const x1 = Math.ceil((r.left + r.width) / PX) - 1;
	const y1 = Math.ceil((r.top + r.height) / PX) - 1;
	for (let cy = y0; cy <= y1; cy++) {
		for (let cx = x0; cx <= x1; cx++) {
			let hits = 0;
			for (const sy of SAMPLES) {
				for (const sx of SAMPLES) {
					const point = new DOMPoint((cx + sx) * PX, (cy + sy) * PX);
					const inside = tests.some(({ part, inverse, fill, stroke }) => {
						const local = point.matrixTransform(inverse);
						return (fill && part.isPointInFill(local)) || (stroke && part.isPointInStroke(local));
					});
					if (inside) hits++;
				}
			}
			if (hits) cells.push(cx, cy, 0.35 + (0.6 * hits) / SAMPLES.length ** 2);
		}
	}
	return cells;
};

// ? Perceived brightness (0-1) and alpha of any CSS colour, read back through a 1px canvas so
// ? oklch/hsl/color-mix all resolve the same way the page paints them
const makeColorReader = (): ((color: string) => { light: number; alpha: number }) => {
	const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
	return (color) => {
		if (!ctx) return { light: 0, alpha: 0 };
		ctx.clearRect(0, 0, 1, 1);
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		return { light: (0.299 * r + 0.587 * g + 0.114 * b) / 255, alpha: a / 255 };
	};
};

// ? Reads the real page under the overlay: every line of text, heading, image and card
const measurePage = (): Shape[] => {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const shapes: Shape[] = [];
	clipCache.clear();

	const byHeading = new Map<boolean, Rect[]>([
		[false, []],
		[true, []],
	]);
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) =>
			node.nodeValue?.trim() &&
			!node.parentElement?.closest(`${IGNORE}, svg`) &&
			isShown(node.parentElement)
				? NodeFilter.FILTER_ACCEPT
				: NodeFilter.FILTER_REJECT,
	});
	const range = document.createRange();
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		range.selectNodeContents(node);
		// Headings, and any display-size text (an element tile's symbol), get the brighter ink
		const heading =
			Boolean(node.parentElement?.closest("h1, h2, h3")) ||
			Number.parseFloat(getComputedStyle(node.parentElement as Element).fontSize) >= 18;
		for (const raw of range.getClientRects()) {
			const rect = clipTo(raw, node.parentElement);
			if (inViewport(rect, vh)) byHeading.get(heading)?.push(rect);
		}
	}
	for (const [heading, rects] of byHeading) {
		for (const rect of mergeLines(rects).slice(0, MAX_LINES)) {
			shapes.push({ kind: heading ? "heading" : "text", rect });
		}
	}

	const readColor = makeColorReader();
	const page = readColor(getComputedStyle(document.documentElement).backgroundColor);
	const pageLight =
		page.alpha > 0 ? page.light : readColor(getComputedStyle(document.body).backgroundColor).light;

	let boxes = 0;
	for (const el of document.body.querySelectorAll<Element>("*")) {
		if (boxes >= MAX_BOXES || el.closest(IGNORE) || !isShown(el)) continue;
		// Inside an SVG only the <svg> itself counts; its paths aren't separate shapes
		const svg = el.closest("svg");
		if (svg && svg !== el) continue;
		const r = clipTo(el.getBoundingClientRect(), el.parentElement);
		if (!inViewport(r, vh)) continue;

		if (svg && r.width >= 24 && r.height >= 24) {
			const cells = traceSvg(svg, r);
			shapes.push(cells ? { kind: "vector", rect: r, cells } : { kind: "image", rect: r });
			boxes++;
			continue;
		}
		if (el.matches(MEDIA) && r.width >= 24 && r.height >= 24) {
			shapes.push({ kind: "image", rect: r });
			boxes++;
			continue;
		}
		if (svg) {
			if (r.width >= 8 && r.height >= 8) {
				shapes.push({ kind: "icon", rect: r });
				boxes++;
			}
			continue;
		}

		const style = getComputedStyle(el);

		// A bare filled block (a swatch, a window light, a caret) draws at its own shade
		if (
			el.childElementCount === 0 &&
			!el.textContent?.trim() &&
			r.width >= 6 &&
			r.height >= 6 &&
			r.width < vw / 2 &&
			r.height < vh / 2
		) {
			// ...unless it covers text, like a reveal box that hasn't slid away yet
			const parent = el.parentElement;
			const box = parent?.getBoundingClientRect();
			const coversText =
				Boolean(parent?.textContent?.trim()) &&
				box !== undefined &&
				r.width * r.height >= box.width * box.height * 0.5;
			const { light, alpha } = readColor(style.backgroundColor);
			const contrast = alpha * Math.abs(light - pageLight);
			if (contrast > 0.04 && !coversText) {
				shapes.push({ kind: "fill", rect: r, ink: Math.min(1, 0.15 + contrast) });
				boxes++;
				continue;
			}
		}

		const sides = ["top", "right", "bottom", "left"].map((side) =>
			style.getPropertyValue(`border-${side}-style`) === "none"
				? 0
				: Number.parseFloat(style.getPropertyValue(`border-${side}-width`))
		) as Edge["sides"];
		if (!sides.some((w) => w > 0) || r.width >= vw * 0.96) continue;

		const round =
			Number.parseFloat(style.borderTopLeftRadius) >= Math.min(r.width, r.height) / 2 - 1;
		const boxed = sides.every((w) => w > 0);
		// Whole boxes need some size; a single rule (a leader, a track) needs some length, either way;
		// a ring (a jack, a station) can be small
		const bigEnough = round
			? r.width >= 8
			: boxed
				? r.width >= 24 && r.height >= 16
				: Math.max(r.width, r.height) >= 24;
		// A bordered frame around an image is the image, not a card
		const media = el.querySelector(MEDIA)?.getBoundingClientRect();
		const framesMedia =
			media && Math.abs(media.width - r.width) < 6 && Math.abs(media.height - r.height) < 6;
		if (bigEnough && !framesMedia) {
			const broken = /dashed|dotted/.test(style.borderStyle);
			shapes.push({ kind: "card", rect: r, edge: { sides, broken, round } });
			boxes++;
		}
	}

	return shapes;
};

// ? Resolve a theme token (stored as raw HSL channels) to a colour the canvas can use; body's
// ? own background can be transparent, so it can't be read directly
const themeColor = (token: string, host: Element): string => {
	const probe = document.createElement("span");
	probe.style.color = `hsl(var(${token}))`;
	host.appendChild(probe);
	const color = getComputedStyle(probe).color;
	probe.remove();
	return color;
};

// ? Cheap deterministic noise per cell, so the pixels shimmer like rendered glyphs
const hash = (x: number, y: number): number => {
	const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return h - Math.floor(h);
};

const smooth = (t: number): number => {
	const c = Math.min(Math.max(t, 0), 1);
	return c * c * (3 - 2 * c);
};

type Pixel = { x: number; y: number; ink: number; on: number; off: number };
type Tile = { x: number; y: number; off: number };

// ? Diagonal wave, top-left to bottom-right, shared by tiles and pixels so they leave together
const waveAt = (x: number, y: number, vw: number, vh: number): number =>
	RESOLVE + ((x / vw) * 0.4 + (y / vh) * 0.6) * WAVE + hash(x, y) * JITTER;

const rasterise = (shapes: Shape[], vw: number, vh: number): Pixel[] => {
	const cols = Math.ceil(vw / PX);
	const rows = Math.ceil(vh / PX);
	const ink = new Float32Array(cols * rows);
	const put = (cx: number, cy: number, value: number): void => {
		if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
		const i = cy * cols + cx;
		ink[i] = Math.max(ink[i], value);
	};

	for (const { kind, rect, edge, cells, ink: shade } of shapes) {
		const x0 = Math.floor(rect.left / PX);
		const x1 = Math.ceil((rect.left + rect.width) / PX) - 1;
		let y0 = Math.floor(rect.top / PX);
		let y1 = Math.ceil((rect.top + rect.height) / PX) - 1;

		if (kind === "text" || kind === "heading") {
			// Keep the x-height band of the line, so lines read as pixel text, not blocks
			const band = kind === "heading" ? 0.7 : 0.5;
			const mid = (rect.top + rect.height / 2) / PX;
			const half = Math.max(0.5, (rect.height * band) / PX / 2);
			y0 = Math.round(mid - half);
			y1 = Math.max(y0, Math.round(mid + half) - 1);
			const base = kind === "heading" ? 0.95 : 0.55;
			for (let cy = y0; cy <= y1; cy++) {
				for (let cx = x0; cx <= x1; cx++) {
					// Gaps between "glyphs" keep it from looking like a solid bar
					const n = hash(cx, cy);
					if (n < 0.14) continue;
					put(cx, cy, base * (0.55 + 0.45 * n));
				}
			}
		} else if (kind === "image") {
			// Ordered dither, lighter towards the top
			for (let cy = y0; cy <= y1; cy++) {
				const shade = 0.65 - ((cy - y0) / Math.max(1, y1 - y0)) * 0.35;
				for (let cx = x0; cx <= x1; cx++) {
					put(cx, cy, (cx + cy) % 2 === 0 ? shade : shade * 0.35);
				}
			}
		} else if (kind === "vector" && cells) {
			for (let i = 0; i < cells.length; i += 3) put(cells[i], cells[i + 1], cells[i + 2]);
		} else if (kind === "fill" && shade) {
			for (let cy = y0; cy <= y1; cy++) {
				for (let cx = x0; cx <= x1; cx++) put(cx, cy, shade);
			}
		} else if (kind === "icon") {
			// A small glyph: a checkered block
			for (let cy = y0; cy <= y1; cy++) {
				for (let cx = x0; cx <= x1; cx++) put(cx, cy, (cx + cy) % 2 === 0 ? 0.6 : 0.25);
			}
		} else if (edge) {
			// Thicker edges draw brighter (a keycap's bottom); dashed/dotted ones skip every
			// other cell, and a circle is traced as a ring
			const inkFor = (w: number): number => Math.min(1, 0.3 + w * 0.2);
			const keep = (i: number): boolean => !edge.broken || i % 2 === 0;
			if (edge.round) {
				// In cell coordinates a cell's centre is at index + 0.5, so shift back to round true
				const cx0 = (rect.left + rect.width / 2) / PX - 0.5;
				const cy0 = (rect.top + rect.height / 2) / PX - 0.5;
				const radius = Math.max(1, Math.min(rect.width, rect.height) / 2 / PX - 0.5);
				const steps = Math.max(8, Math.round(radius * 8));
				for (let i = 0; i < steps; i++) {
					if (!keep(i)) continue;
					const a = (i / steps) * Math.PI * 2;
					put(
						Math.round(cx0 + Math.cos(a) * radius),
						Math.round(cy0 + Math.sin(a) * radius),
						inkFor(edge.sides[0])
					);
				}
			} else {
				const [top, right, bottom, left] = edge.sides;
				for (let cx = x0; cx <= x1; cx++) {
					if (!keep(cx - x0)) continue;
					if (top) put(cx, y0, inkFor(top));
					if (bottom) put(cx, y1, inkFor(bottom));
				}
				for (let cy = y0; cy <= y1; cy++) {
					if (!keep(cy - y0)) continue;
					if (left) put(x0, cy, inkFor(left));
					if (right) put(x1, cy, inkFor(right));
				}
			}
		}
	}

	const pixels: Pixel[] = [];
	for (let cy = 0; cy < rows; cy++) {
		for (let cx = 0; cx < cols; cx++) {
			const value = ink[cy * cols + cx];
			if (!value) continue;
			const x = cx * PX;
			const y = cy * PX;
			pixels.push({
				x,
				y,
				ink: value,
				on: 0.08 + Math.min(y / vh, 1) * SCAN + hash(cy, cx) * JITTER,
				// Leave just before the tile behind it, so the real text shows through as they cross
				off: waveAt(x, y, vw, vh) - 0.04,
			});
		}
	}
	return pixels;
};

const tilesFor = (vw: number, vh: number): Tile[] => {
	const tiles: Tile[] = [];
	for (let y = 0; y < vh; y += TILE) {
		for (let x = 0; x < vw; x += TILE) tiles.push({ x, y, off: waveAt(x, y, vw, vh) });
	}
	return tiles;
};

// ? Lives as long as the JS bundle: resets on a refresh, survives client-side navigation, so
// ? clicking back to Home doesn't replay the intro
let played = false;

// ? Plays on a full load of the home page: the page is rasterised into pixels in place,
// ? scanned in top to bottom, then dissolved in a diagonal wave into the real page.
// ? Ported from tn10 (src/components/animated/BootPixels.tsx); keep the two in step
export const BootPixels: FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const statusRef = useRef<HTMLParagraphElement>(null);
	const percentRef = useRef<HTMLSpanElement>(null);

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		const overlay = canvas?.closest<HTMLElement>(".boot-intro");
		const ctx = canvas?.getContext("2d");
		if (!canvas || !overlay || !ctx) return;
		if (played || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			overlay.classList.add("boot-done");
			return;
		}

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(vw * dpr);
		canvas.height = Math.round(vh * dpr);
		ctx.scale(dpr, dpr);

		// Entrance animations start offset or clipped; measure where things
		// will end up by switching transforms off for this one synchronous read
		const root = document.documentElement;
		root.classList.add("boot-measuring");
		const shapes = measurePage();
		root.classList.remove("boot-measuring");

		const background = themeColor("--background", overlay);
		const foreground = themeColor("--foreground", overlay);
		const pixels = rasterise(shapes, vw, vh);
		const tiles = tilesFor(vw, vh);

		let frame = 0;
		const start = performance.now();
		const draw = (now: number): void => {
			const t = (now - start) / 1000;
			ctx.clearRect(0, 0, vw, vh);

			ctx.fillStyle = background;
			for (const tile of tiles) {
				const alpha = 1 - smooth((t - tile.off) / FADE_OUT);
				if (alpha <= 0) continue;
				ctx.globalAlpha = alpha;
				ctx.fillRect(tile.x, tile.y, TILE, TILE);
			}

			ctx.fillStyle = foreground;
			for (const p of pixels) {
				const alpha = p.ink * smooth((t - p.on) / FADE_IN) * (1 - smooth((t - p.off) / FADE_OUT));
				if (alpha <= 0.01) continue;
				ctx.globalAlpha = alpha;
				ctx.fillRect(p.x, p.y, PX - 1, PX - 1);
			}
			ctx.globalAlpha = 1;

			const progress = Math.min(t / RESOLVE, 1);
			if (percentRef.current) {
				percentRef.current.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
			}
			if (statusRef.current) {
				statusRef.current.style.opacity = String(1 - smooth((t - RESOLVE) / 0.3));
			}

			if (t < END) {
				frame = requestAnimationFrame(draw);
			} else {
				// Set on completion, not start: dev Strict Mode runs this effect twice
				played = true;
				overlay.classList.add("boot-done");
			}
		};

		// The canvas now paints the background itself, so the CSS fallback can step aside
		draw(start);
		overlay.classList.add("boot-live");
		frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<>
			<canvas ref={canvasRef} className="boot-canvas" />
			<p ref={statusRef} className="boot-status">
				[ workbench ] <span className="boot-dim">docking ·</span> <span ref={percentRef}>000%</span>
				<span className="boot-caret" />
			</p>
		</>
	);
};
