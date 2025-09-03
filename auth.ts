import { prisma } from "@/shared/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	baseUrl: process.env.BETTER_AUTH_URL,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	plugins: [
		nextCookies(),
		passkey({
			rpID: "localhost",
			rpName: "Jimbao",
			origin: "http://localhost:3000",
		}),
	],
	pages: {
		error: "/auth/error",
		signIn: "/signin",
	},
});
