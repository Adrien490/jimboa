import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { type ActionCtx } from "../../../convex/_generated/server";
import { betterAuthComponent } from "../../../convex/auth";

export const createAuth = (ctx: ActionCtx) => {
	// Utiliser la variable d'environnement SITE_URL ou une valeur par défaut
	const siteUrl = process.env.SITE_URL || "https://jimbao.fr";

	return betterAuth({
		// All auth requests will be proxied through your next.js server
		baseURL: siteUrl,
		database: convexAdapter(ctx, betterAuthComponent),

		// Simple non-verified email/password to get started
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},

		// Social providers
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			},
		},

		plugins: [
			// The Convex plugin is required
			convex(),
		],
	});
};
