import { useAuthUserId, useQuery } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
	const userId = useAuthUserId();
	const user = useQuery(api.users.current, userId ? {} : "skip");
	
	return {
		user: user || null,
		userId: userId || null,
		isAuthenticated: !!userId,
		isLoading: user === undefined && !!userId,
	};
}
