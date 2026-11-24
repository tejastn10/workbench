import { BootPixels } from "./boot-pixels";

// Full-screen intro for the home page. The overlay is server-rendered in the background colour
// so it covers the page from the first paint; BootPixels then takes over drawing.
// Reduced-motion users skip it entirely (handled in CSS).
export function BootIntro() {
	return (
		<div className="boot-intro" aria-hidden="true">
			<BootPixels />
		</div>
	);
}
