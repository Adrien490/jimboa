import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
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
						<div className="bg-background">
							<main>{children}</main>
						</div>
						<Toaster
							position="top-center"
							expand={false}
							visibleToasts={3}
							richColors
							closeButton
							className="toaster-custom"
							toastOptions={{
								className: "toast-custom",
								duration: 4000,
								style: {
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: "12px",
									backdropFilter: "blur(12px)",
									boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
								},
							}}
						/>
					</ConvexClientProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
