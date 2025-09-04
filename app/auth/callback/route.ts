import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// Si "next" est dans les paramètres, l'utiliser comme URL de redirection
	let next = searchParams.get("next") ?? "/groups";

	// Sécurité : s'assurer que "next" est une URL relative
	if (!next.startsWith("/")) {
		next = "/groups";
	}

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			const forwardedHost = request.headers.get("x-forwarded-host"); // origine avant load balancer
			const isLocalEnv = process.env.NODE_ENV === "development";

			if (isLocalEnv) {
				// En développement local, pas de load balancer
				return NextResponse.redirect(`${origin}${next}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			} else {
				return NextResponse.redirect(`${origin}${next}`);
			}
		}
	}

	// Rediriger vers une page d'erreur avec des instructions
	return NextResponse.redirect(`${origin}/error`);
}
