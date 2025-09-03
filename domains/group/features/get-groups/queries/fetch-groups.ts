import { prisma } from "@/shared/lib/prisma";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { z } from "zod";
import {
	GET_GROUPS_DEFAULT_ORDER_BY,
	GET_GROUPS_DEFAULT_SELECT,
	GET_GROUPS_MAX_RESULTS,
} from "../constants";
import { getGroupsSchema } from "../schemas";
import { GetGroupsReturn } from "../types";
import { buildWhereClause } from "./build-where-clause";

/**
 * Fonction interne qui récupère tous les groupes selon les critères
 */
export async function fetchGroups(
	params: z.infer<typeof getGroupsSchema>
): Promise<GetGroupsReturn> {
	"use cache";

	// Tag de base pour tous les groupes
	cacheTag(`groups`);

	// Tag pour la recherche textuelle
	if (params.search) {
		cacheTag(`groups:search:${params.search}`);
	}

	// Tag pour le tri par défaut
	cacheTag(`groups:sort:default`);

	// Tag pour l'utilisateur spécifique
	if (params.userId) {
		cacheTag(`groups:user:${params.userId}`);
	}

	cacheLife({
		revalidate: 60 * 5, // 5 minutes (plus court que contact-requests car plus dynamique)
		stale: 60 * 10, // 10 minutes
		expire: 60 * 30, // 30 minutes
	});

	try {
		const where = buildWhereClause(params);

		// Get data with performance tracking and safety limit
		const groups = await prisma.group.findMany({
			where,
			select: GET_GROUPS_DEFAULT_SELECT,
			take: GET_GROUPS_MAX_RESULTS, // Limite de sécurité
			orderBy: GET_GROUPS_DEFAULT_ORDER_BY,
		});

		return groups;
	} catch {
		return [];
	}
}
