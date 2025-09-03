import { ActionState, ActionStatus } from "@/shared/types/server-action";
import { z } from "zod";
import { Callbacks } from "./types";

// Type pour les callbacks utilisés dans withCallbacks

/**
 * Fonction d'ordre supérieur qui enveloppe une action serveur et ajoute des callbacks
 * pour la gestion d'état (démarrage, fin, succès, erreur)
 *
 * @param fn La fonction d'action serveur à envelopper
 * @param callbacks Les callbacks à exécuter aux différentes étapes
 * @returns Une nouvelle fonction qui exécute l'action serveur avec les callbacks
 */
export const withCallbacks = <
	Args extends unknown[],
	TData = unknown,
	TSchema extends z.ZodType = z.ZodType,
	T extends ActionState<TData, TSchema> = ActionState<TData, TSchema>,
	R = unknown
>(
	fn: (...args: Args) => Promise<T>,
	callbacks: Callbacks<T, R>
): ((...args: Args) => Promise<T>) => {
	return async (...args: Args) => {
		const promise = fn(...args);

		// Appel du callback de démarrage et récupération de la référence (pour les toasts par exemple)
		const reference = callbacks.onStart?.();

		const result = await promise;

		// Appel du callback de fin si une référence est disponible
		if (reference) {
			callbacks.onEnd?.(reference);
		}

		// Appel du callback de succès si l'action a réussi
		if (result?.status === ActionStatus.SUCCESS) {
			callbacks.onSuccess?.(result);
		}
		// Appel du callback d'erreur pour tous les statuts d'erreur
		else {
			callbacks.onError?.(result);
		}

		return result; // Retourne le résultat résolu, pas la promesse initiale
	};
};
