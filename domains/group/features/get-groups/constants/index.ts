import { Prisma } from "@/lib/generated/prisma";

// Limite de sécurité pour éviter de charger trop de groupes d'un coup
export const GET_GROUPS_MAX_RESULTS = 1000;

/**
 * Sélection par défaut des champs pour les groupes
 * Optimisée pour correspondre exactement au schéma Prisma et aux besoins de l'interface
 */
export const GET_GROUPS_DEFAULT_SELECT = {
	// Identifiants et informations de base
	id: true,
	name: true,
	code: true,
	type: true,
	imageUrl: true,
	dailyHour: true,
	dailyMinute: true,
	maxMembers: true,
	createdAt: true,
	deletedAt: true,

	// Relations avec sélections optimisées
	owner: {
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
		},
	},

	memberships: {
		select: {
			id: true,
			role: true,
			status: true,
			nickname: true,
			displayName: true,
			avatarUrl: true,
			createdAt: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	},

	_count: {
		select: {
			memberships: true,
			prompts: true,
		},
	},
} as const satisfies Prisma.GroupSelect;

// Tri par défaut : les groupes les plus récents en premier
export const GET_GROUPS_DEFAULT_ORDER_BY = { createdAt: "desc" as const };
