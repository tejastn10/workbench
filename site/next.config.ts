import type { NextConfig } from "next";

// Project Pages site lives at https://tejastn10.github.io/workbench/
const repo = "workbench";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	images: { unoptimized: true },
	basePath: isProd ? `/${repo}` : "",
	assetPrefix: isProd ? `/${repo}/` : "",
	env: {
		NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : "",
	},
};

export default nextConfig;
