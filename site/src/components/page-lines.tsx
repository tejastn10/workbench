// The site's backdrop: two fixed rules framing the content column, a perspective
// grid floor fading out toward the horizon, and tejastn10.com's glowing corner lines.
export function PageLines() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
			<div className="backdrop-floor" />
			<div className="absolute inset-0 mx-auto hidden max-w-[1800px] lg:block">
				<div className="absolute inset-y-0 left-0 w-px bg-border" />
				<div className="absolute inset-y-0 right-0 w-px bg-border" />
			</div>
			<div className="fixed bottom-0 left-8 hidden md:block">
				<div className="flex flex-col items-center after:block after:h-40 after:w-px after:animate-glow after:bg-gradient-to-b after:from-foreground/20 after:to-transparent" />
			</div>
			<div className="fixed top-0 right-8 hidden md:block">
				<div className="flex flex-col items-center after:block after:h-40 after:w-px after:animate-glow after:bg-gradient-to-t after:from-foreground/20 after:to-transparent" />
			</div>
			<div className="fixed top-8 right-0 hidden md:block">
				<div className="flex flex-row items-center after:block after:h-px after:w-24 after:animate-glow after:bg-gradient-to-r after:from-foreground/20 after:to-transparent" />
			</div>
			<div className="fixed bottom-8 left-0 hidden md:block">
				<div className="flex flex-row items-center after:block after:h-px after:w-24 after:animate-glow after:bg-gradient-to-l after:from-foreground/20 after:to-transparent" />
			</div>
		</div>
	);
}
