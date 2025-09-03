"use server";

import { auth } from "@/auth";
import { ActionStatus, ServerAction } from "@/shared/types/server-action";
import console from "console";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signInSocialSchema } from "./sign-in-social-schema";
import { ResponseState } from "./types";

// Interface pour typer	 la l'erreur de redirection Next.js
interface NextRedirectError extends Error {
	digest?: string;
}

export const signInSocial: ServerAction<
	ResponseState,
	typeof signInSocialSchema
> = async (_, formData) => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (session?.user?.id) {
			console.log("⚠️ Utilisateur déjà connecté:", session.user.id);
			return {
				status: ActionStatus.UNAUTHORIZED,
				message: "Vous êtes déjà connecté",
			};
		}

		const rawData = {
			provider: formData.get("provider") as string,
			callbackURL: (formData.get("callbackURL") as string) || "/dashboard",
		};

		const validation = signInSocialSchema.safeParse(rawData);
		if (!validation.success) {
			return {
				status: ActionStatus.VALIDATION_ERROR,
				message: "Données invalides",
				validationErrors: validation.error.flatten().fieldErrors,
			};
		}

		const { provider, callbackURL } = validation.data;

		try {
			const response = await auth.api.signInSocial({
				body: {
					provider,
					callbackURL,
				},
			});

			if (!response) {
				return {
					status: ActionStatus.ERROR,
					message: "Aucune réponse du service d'authentification",
				};
			}
			if (!response.url) {
				return {
					status: ActionStatus.ERROR,
					message: "URL de redirection manquante",
				};
			}

			// La redirection va lancer une erreur NEXT_REDIRECT, c'est normal
			// Next.js utilise cette erreur en interne pour gérer les redirections
			redirect(response.url);
		} catch (error) {
			// Vérifier si l'erreur est liée à une redirection Next.js
			if (
				error instanceof Error &&
				(error.message === "NEXT_REDIRECT" ||
					(error as NextRedirectError).digest?.startsWith("NEXT_REDIRECT"))
			) {
				// Laisser l'erreur de redirection se propager
				throw error;
			}

			const errorMessage =
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la connexion";

			return {
				status: ActionStatus.ERROR,
				message: errorMessage,
			};
		}
	} catch (error) {
		// Vérifier si l'erreur est liée à une redirection Next.js
		if (
			error instanceof Error &&
			(error.message === "NEXT_REDIRECT" ||
				(error as NextRedirectError).digest?.startsWith("NEXT_REDIRECT"))
		) {
			// Laisser l'erreur de redirection se propager
			throw error;
		}

		const errorMessage =
			error instanceof Error
				? error.message
				: "Une erreur inattendue est survenue";

		return {
			status: ActionStatus.ERROR,
			message: errorMessage,
		};
	}
};
