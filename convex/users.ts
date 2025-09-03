import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

export const current = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		// Récupérer les informations utilisateur depuis la table auth
		const user = await ctx.db.get(userId);
		return user;
	},
});

export const removeUserImage = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return;
		}
		await ctx.db.patch(userId, { email: undefined });
	},
});
