import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/groups(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

	// Rediriger vers /groups si connecté et sur la page d'accueil
	if (userId && req.nextUrl.pathname === "/") {
		return NextResponse.redirect(new URL("/groups", req.url));
	}

	// Protéger les routes /groups
	if (isProtectedRoute(req)) {
		if (!userId) {
			return NextResponse.redirect(new URL("/", req.url));
		}
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
