import { ActionState } from "@/shared/types/server-action";
import { toast } from "sonner";
import { z } from "zod";

// Type simplifiée pour les options
export type ToastCallbacksOptions<
	TData = unknown,
	TSchema extends z.ZodType = z.ZodType
> = {
	// Message affiché pendant le chargement
	loadingMessage?: string;

	// Callbacks personnalisables
	onSuccess?: (result: ActionState<TData, TSchema>) => void;
	onError?: (result: ActionState<TData, TSchema>) => void;

	// Action pour les toasts (bouton dans le toast)
	action?: {
		label: string;
		onClick: (data?: TData) => void;
	};
};

/**
 * Crée des callbacks pour les toasts d'actions serveur
 */
export const createToastCallbacks = <
	TData = unknown,
	TSchema extends z.ZodType = z.ZodType
>(
	options: ToastCallbacksOptions<TData, TSchema>
) => {
	return {
		// Affiche le toast de chargement
		onStart: () => {
			// On garde le toast de chargement sans fermer les autres
			return toast.loading(options.loadingMessage || "Chargement...");
		},

		// Ferme le toast de chargement
		onEnd: (reference: string | number) => {
			toast.dismiss(reference);
		},

		// Gère le succès
		onSuccess: (result: ActionState<TData, TSchema>) => {
			// Si l'utilisateur a défini son propre comportement
			if (options.onSuccess) {
				// Fermer tous les toasts existants (sauf celui de chargement)
				toast.dismiss();

				options.onSuccess(result);
			} else if (result?.message) {
				// Comportement par défaut
				// Fermer tous les toasts existants (sauf celui de chargement)
				toast.dismiss();

				let action;

				if (options.action && result.data) {
					action = {
						label: options.action.label,
						onClick: () => options.action?.onClick(result.data as TData),
					};
				}

				toast.success(result.message, { action });
			}

			// Réinitialiser le formulaire si la fonction est fournie
		},

		// Gère l'erreur
		onError: (result: ActionState<TData, TSchema>) => {
			if (result?.message) {
				//toast.error(result.message);
			}

			// Si l'utilisateur a défini son propre comportement
			if (options.onError) {
				// Fermer tous les toasts existants (sauf celui de chargement)
				toast.dismiss();

				options.onError(result);
				return;
			}
		},
	};
};
