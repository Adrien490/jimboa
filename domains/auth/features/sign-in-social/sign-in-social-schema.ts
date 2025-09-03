import { z } from "zod";

export const signInSocialSchema = z.object({
	provider: z.enum(["google", "github"]),
	callbackURL: z.string().optional(),
});
