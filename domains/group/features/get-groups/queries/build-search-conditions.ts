import { Prisma } from "@/lib/generated/prisma";

/**
 * Construit les conditions de recherche textuelle pour les groupes
 * @param search - Terme de recherche
 * @returns Array de conditions OR pour Prisma
 */
export const buildSearchConditions = (
	search: string
): Prisma.GroupWhereInput[] => {
	const searchTerm = search.trim();
	
	if (!searchTerm) {
		return [];
	}

	return [
		// Recherche dans le nom du groupe
		{
			name: {
				contains: searchTerm,
				mode: "insensitive",
			},
		},
		// Recherche dans le code du groupe
		{
			code: {
				contains: searchTerm,
				mode: "insensitive",
			},
		},
		// Recherche dans le nom du propriétaire
		{
			owner: {
				name: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
		},
		// Recherche dans l'email du propriétaire
		{
			owner: {
				email: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
		},
		// Recherche dans les pseudos des membres
		{
			memberships: {
				some: {
					OR: [
						{
							nickname: {
								contains: searchTerm,
								mode: "insensitive",
							},
						},
						{
							displayName: {
								contains: searchTerm,
								mode: "insensitive",
							},
						},
					],
				},
			},
		},
	];
};
