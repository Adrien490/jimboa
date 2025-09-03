"use server";

import { z } from "zod";
import { getGroupsSchema } from "../schemas";
import { GetGroupsReturn } from "../types";
import { fetchGroups } from "./fetch-groups";

/**
 * Récupère la liste des groupes avec recherche et filtrage
 * @param params - Paramètres validés par getGroupsSchema
 * @returns Liste des groupes
 */
export async function getGroups(
	params: z.infer<typeof getGroupsSchema>
): Promise<GetGroupsReturn> {
	try {
		const validation = getGroupsSchema.safeParse(params);

		if (!validation.success) {
			throw new Error("Invalid parameters");
		}

		const validatedParams = validation.data;

		return await fetchGroups(validatedParams);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error("Invalid parameters");
		}

		throw error;
	}
}
