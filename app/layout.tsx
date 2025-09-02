import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ConvexClientProvider } from "../shared/providers/convex-client-provider";
import "./globals.css";

// Satoshi - Titres uniquement (Medium comme SemiBold + Bold)
const satoshi = localFont({
	src: [
		{
			path: "./fonts/Satoshi-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	variable: "--font-satoshi",
	display: "swap",
	preload: true,
	fallback: ["system-ui", "-apple-system", "sans-serif"],
});

// Inter - Corps de texte (Regular & Medium)
const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500"], // Regular & Medium pour le texte
	preload: true,
});

export const metadata: Metadata = {
	title: "jimbao",
	description: "A Progressive Web App built with Next.js",
	applicationName: "jimbao",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "jimbao",
	},
};

export const viewport: Viewport = {
	themeColor: "#000000",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			signInFallbackRedirectUrl="/groups"
			signUpFallbackRedirectUrl="/groups"
		>
			<html lang="fr" className="dark" data-theme="dark">
				<body
					className={`${satoshi.variable} ${inter.variable} antialiased font-body`}
				>
					{/* One-time purge of any previously registered SW + caches */}
					<ConvexClientProvider>
						<div className="min-h-screen bg-background">
							<main>
								<div className="container max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
									{children}
								</div>
							</main>
						</div>
					</ConvexClientProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
