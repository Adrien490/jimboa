import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import {
	GET_GROUPS_DEFAULT_SELECT,
	GET_GROUPS_MAX_RESULTS,
} from "../constants";
import { getGroupsSchema } from "../schemas";
import { GetGroupsReturn } from "../types";

/**
 * Fonction interne qui récupère tous les groupes selon les critères
 */
export async function fetchGroups(
	params: z.infer<typeof getGroupsSchema>
): Promise<GetGroupsReturn> {
	try {
		const supabase = await createClient();

		// Construction de la requête de base
		let query = supabase
			.from("Group")
			.select(GET_GROUPS_DEFAULT_SELECT)
			.is("deleted_at", null)
			.limit(GET_GROUPS_MAX_RESULTS)
			.order("created_at", { ascending: false });

		// Ajout des filtres selon les paramètres
		if (params.search && params.search.trim()) {
			query = query.or(
				`name.ilike.%${params.search}%,code.ilike.%${params.search}%`
			);
		}

		// Filtre par utilisateur spécifique
		if (params.userId) {
			query = query.or(
				`owner_id.eq.${params.userId},memberships.user_id.eq.${params.userId}`
			);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Erreur lors de la récupération des groupes:", error);
			return [];
		}

		// Transformer les données pour correspondre aux types attendus
		const transformedData = (data || []).map((group) => ({
			...group,
			owner: Array.isArray(group.owner) ? group.owner[0] || null : group.owner,
			memberships: (group.memberships || []).map((membership: any) => ({
				...membership,
				user: Array.isArray(membership.user)
					? membership.user[0]
					: membership.user,
			})),
		}));

		return transformedData as GetGroupsReturn;
	} catch (error) {
		console.error(
			"Erreur inattendue lors de la récupération des groupes:",
			error
		);
		return [];
	}
}
