"use client";

import { authClient } from "@/domains/auth/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useSignInPasskey() {
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const signInWithPasskey = async (callbackURL?: string) => {
		try {
			setIsPending(true);
			setError(null);

			// Pure passkey authentication without email
			const result = await authClient.signIn.passkey({
				fetchOptions: {
					method: "POST",
					body: JSON.stringify({
						callbackURL: callbackURL || "/groups",
					}),
				},
			});

			if (result.error) {
				setError(
					result.error.message || "Erreur lors de la connexion avec Passkey"
				);
				toast.error("Erreur de connexion", {
					description: result.error.message || "Impossible de se connecter",
				});
				return;
			}

			if (result.data) {
				toast.success("Connexion réussie !", {
					description: "Redirection en cours...",
				});
				router.push(callbackURL || "/groups");
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Une erreur inattendue s'est produite";
			setError(message);
			toast.error("Erreur de connexion", {
				description: message,
			});
		} finally {
			setIsPending(false);
		}
	};

	return {
		signInWithPasskey,
		isPending,
		error,
	};
}
