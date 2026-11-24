// A socket: hollow at rest, lit when the surrounding `group` is hovered. Shared by the station
// modules on the home page and the MCP connectors, and drawn the same as the patch bay on tn10.
export function Jack({ lit = "group-hover:bg-foreground" }: { lit?: string }) {
	return (
		<span
			aria-hidden="true"
			className="grid size-3 shrink-0 place-items-center rounded-full border border-muted-foreground/60"
		>
			<span className={`size-1 rounded-full bg-border transition-colors duration-300 ${lit}`} />
		</span>
	);
}
