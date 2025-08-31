import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { ConvexClientProvider } from "../shared/providers/convex-client-provider";
import "./globals.css";

const syne = Syne({
	variable: "--font-syne",
	subsets: ["latin"],
	display: "swap",
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
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
		<ClerkProvider>
			<html lang="fr" className="dark" data-theme="dark">
				<body
					className={`${syne.variable} ${inter.variable} antialiased font-body`}
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
