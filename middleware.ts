import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/groups"];

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Ignorer les routes API et les fichiers statiques
	if (
		pathname.startsWith("/api/") ||
		pathname.startsWith("/_next/") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// Vérifier la présence du cookie d'authentification Better Auth
	const authCookie =
		request.cookies.get("better-auth.session_token") ||
		request.cookies.get("better-auth-session") ||
		request.cookies.get("session") ||
		request.cookies.get("authjs.session-token");

	const isAuthenticated = !!authCookie?.value;

	// Pour l'instant, ne faisons que la protection des routes
	// Laissons les pages gérer leur propre logique de redirection
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isProtectedRoute && !isAuthenticated) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Only run on pages, not API routes or static files
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
