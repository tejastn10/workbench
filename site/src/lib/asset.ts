const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a /public asset path with the deploy basePath (plain <img> needs this). */
export function asset(path: string): string {
	return `${BASE}${path}`;
}
