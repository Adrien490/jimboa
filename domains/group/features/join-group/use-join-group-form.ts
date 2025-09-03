"use client";

import { useActionState } from "react";
import { joinGroup } from "./join-group";

interface UseJoinGroupFormOptions {
	onSuccess?: (message: string) => void;
	onError?: (error: string) => void;
}

export function useJoinGroupForm(options?: UseJoinGroupFormOptions) {
	const [state, dispatch, isPending] = useActionState(joinGroup, undefined);

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
