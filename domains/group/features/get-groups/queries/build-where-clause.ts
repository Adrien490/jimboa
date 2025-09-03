import { Prisma } from "@/lib/generated/prisma";
import { z } from "zod";
import { getGroupsSchema } from "../schemas";
import { buildSearchConditions } from "./build-search-conditions";

/**
 * Construit la clause WHERE pour la requête Prisma
 * @param params - Paramètres validés de la requête
 * @returns Clause WHERE Prisma complète
 */
export const buildWhereClause = (
	params: z.infer<typeof getGroupsSchema>
): Prisma.GroupWhereInput => {
	// Condition de base - exclure les groupes supprimés
	const whereClause: Prisma.GroupWhereInput = {
		deletedAt: null,
	};

	// Ajouter les conditions de recherche textuelle
	if (typeof params.search === "string" && params.search.trim()) {
		whereClause.OR = buildSearchConditions(params.search);
	}

	// Filtre par utilisateur spécifique (pour les groupes dont l'utilisateur est membre)
	if (params.userId) {
		const userCondition: Prisma.GroupWhereInput = {
			OR: [
				// L'utilisateur est le propriétaire
				{
					ownerId: params.userId,
				},
				// L'utilisateur est membre actif
				{
					memberships: {
						some: {
							userId: params.userId,
							status: "ACTIVE",
						},
					},
				},
			],
		};

		if (whereClause.AND) {
			if (Array.isArray(whereClause.AND)) {
				whereClause.AND = [...whereClause.AND, userCondition];
			} else {
				whereClause.AND = [whereClause.AND, userCondition];
			}
		} else {
			whereClause.AND = [userCondition];
		}
	}

	return whereClause;
};
