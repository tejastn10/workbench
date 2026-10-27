// The site's backdrop: two fixed rules framing the content column and a perspective
// grid floor fading out toward the horizon.
export function PageLines() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
			<div className="backdrop-floor" />
			<div className="absolute inset-0 mx-auto hidden max-w-[1800px] lg:block">
				<div className="absolute inset-y-0 left-0 w-px bg-border" />
				<div className="absolute inset-y-0 right-0 w-px bg-border" />
			</div>
		</div>
	);
}
