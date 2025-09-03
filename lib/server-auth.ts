import { api } from "@/convex/_generated/api";
import { createAuth } from "@/domains/auth/lib/auth";
import { getToken } from "@convex-dev/better-auth/nextjs";
import { fetchQuery } from "convex/nextjs";

export async function getServerAuth() {
	try {
		// Obtenir le token Better Auth pour Next.js
		const token = await getToken(createAuth);

		if (!token) {
			return { user: null, userId: null };
		}

		// Utiliser le token pour faire la requête à Convex
		const user = await fetchQuery(api.auth.getCurrentUser, {}, { token });

		return {
			user,
			userId: user?._id || null,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'authentification serveur:",
			error
		);
		return { user: null, userId: null };
	}
}
