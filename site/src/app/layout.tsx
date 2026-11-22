import "./globals.css";

import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { PageLines } from "@/components/page-lines";
import { Reveal } from "@/components/reveal";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
	title: {
		default: `${SITE.name} — agent skills, instructions & MCP setup`,
		template: `%s · ${SITE.name}`,
	},
	description: SITE.tagline,
	openGraph: { title: SITE.name, description: SITE.tagline, type: "website" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${GeistMono.variable} ${GeistPixelSquare.variable}`}
		>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: one static line, no input
					dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
				/>
			</head>
			<body className="antialiased">
				<ThemeProvider>
					<PageLines />
					<div className="relative z-10 flex min-h-screen flex-col">
						<Nav />
						<main className="mx-auto w-full max-w-[1800px] flex-1 px-5 pt-16 sm:px-8 lg:px-12 xl:px-16">
							{children}
						</main>
						<Footer />
						<Reveal />
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
