import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Avec Convex Auth, laissons les composants client gérer l'authentification
// Le middleware n'est plus nécessaire pour la vérification d'authentification
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

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Only run on pages, not API routes or static files
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
