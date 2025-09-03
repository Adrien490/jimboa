"use client";

import { useActionState } from "react";
import { updateGroup } from "./update-group";

interface UseUpdateGroupFormOptions {
	onSuccess?: (message: string) => void;
	onError?: (error: string) => void;
}

export function useUpdateGroupForm(options?: UseUpdateGroupFormOptions) {
	const [state, dispatch, isPending] = useActionState(updateGroup, undefined);

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
