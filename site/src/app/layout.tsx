import "./globals.css";

import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { PageLines } from "@/components/page-lines";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE } from "@/data/site";

const archivo = Archivo({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-archivo",
	display: "swap",
});

const archivoBlack = Archivo_Black({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-archivo-black",
	display: "swap",
});

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
			className={`${GeistMono.variable} ${archivo.variable} ${archivoBlack.variable}`}
		>
			<body className="antialiased">
				<ThemeProvider>
					<PageLines />
					<div className="relative z-10 flex min-h-screen flex-col">
						<Nav />
						<main className="mx-auto w-full max-w-[1800px] flex-1 px-5 sm:px-8 lg:px-12 xl:px-16">
							{children}
						</main>
						<Footer />
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
