import z from "zod";

export const createGroupSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Le nom du groupe est requis")
		.min(2, "Le nom doit contenir au moins 2 caractères")
		.max(100, "Le nom ne peut pas dépasser 100 caractères")
		.refine(
			(name) => name.length > 0 && name.trim().length > 0,
			"Le nom ne peut pas être vide"
		),
	type: z.enum(["friends", "couple"], {
		message: "Veuillez sélectionner un type de groupe",
	}),
	imageUrl: z
		.string()
		.url("L'URL de l'image doit être valide")
		.optional()
		.or(z.literal("")),
});
