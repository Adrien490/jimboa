import z from "zod";

export const joinGroupSchema = z.object({
	code: z
		.string()
		.trim()
		.min(1, "Le code d'invitation est requis")
		.min(6, "Le code doit contenir au moins 6 caractères")
		.max(10, "Le code ne peut pas dépasser 10 caractères")
		.regex(
			/^[A-Z0-9]+$/,
			"Le code ne peut contenir que des lettres majuscules et des chiffres"
		)
		.transform((code) => code.toUpperCase()),
});
