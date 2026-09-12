// Fixed vertical rules framing the content column — the Nimbus "page lines" motif.
export function PageLines() {
	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 z-0 mx-auto hidden max-w-6xl lg:block"
		>
			<div className="absolute inset-y-0 left-0 w-px bg-border" />
			<div className="absolute inset-y-0 right-0 w-px bg-border" />
		</div>
	);
}
