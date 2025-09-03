"use client";

import { useActionState } from "react";
import { logout } from "./logout";

export function useLogout() {
	const [state, dispatch, isPending] = useActionState(logout, null);

	return { state, dispatch, isPending };
}
