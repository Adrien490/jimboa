import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";

export async function getServerAuth() {
	try {
		// Récupérer les cookies d'authentification
		const cookieStore = await cookies();

		// Convex Auth utilise un JWT dans les cookies
		const authCookie = cookieStore.get("convex-auth");

		if (!authCookie?.value) {
			return { user: null, userId: null };
		}

		// Utiliser le JWT pour faire la requête à Convex
		// Le JWT sera automatiquement validé par Convex
		try {
			const user = await fetchQuery(api.users.current, {});
			return {
				user,
				userId: user?._id || null,
			};
		} catch (error) {
			console.error("Erreur lors de la récupération de l'utilisateur:", error);
			return { user: null, userId: null };
		}
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'authentification serveur:",
			error
		);
		return { user: null, userId: null };
	}
}
