import type { NextConfig } from "next";

// Static export, served from the root of www.workbench.tejastn10.com on Vercel.
const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	images: { unoptimized: true },
};

export default nextConfig;
