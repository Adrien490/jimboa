import { z } from "zod";

export const getGroupsSchema = z.object({
	search: z.string().optional(),
	userId: z.string().optional(), // Pour filtrer les groupes d'un utilisateur spécifique
});

export * from "./group-type-schema";
export * from "./membership-status-schema";
