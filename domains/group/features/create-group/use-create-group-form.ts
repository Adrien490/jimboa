"use client";

import { useActionState } from "react";
import { createGroup } from "./create-group";

interface UseCreateGroupFormOptions {
	onSuccess?: (message: string) => void;
	onError?: (error: string) => void;
}

export function useCreateGroupForm(options?: UseCreateGroupFormOptions) {
	const [state, dispatch, isPending] = useActionState(createGroup, undefined);

	// Handle success/error side effects
	if (state?.status === "success" && options?.onSuccess) {
		options.onSuccess(state.message);
	}

	if (state?.status === "error" && options?.onError) {
		options.onError(state.message);
	}

	return {
		state,
		dispatch,
		isPending,
	};
}
