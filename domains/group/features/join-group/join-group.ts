"use server";

import { headers } from "next/headers";
import z from "zod";

import { auth } from "@/auth";
import { prisma } from "@/shared/lib/prisma";
import { ActionStatus, ServerAction } from "@/shared/types/server-action";
import { joinGroupSchema } from "./join-group-schema";

export const joinGroup: ServerAction<
	z.infer<typeof joinGroupSchema>,
	typeof joinGroupSchema
> = async (_, formData) => {
	try {
		// 1. Vérification de l'authentification
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				status: ActionStatus.ERROR,
				message: "Vous devez être connecté pour rejoindre un groupe.",
			};
		}

		const userId = session.user.id;

		// 2. Extraction et validation des données du formulaire
		const rawData = {
			code: formData.get("code") as string,
		};

		// 3. Validation des données avec Zod
		const validation = joinGroupSchema.safeParse(rawData);
		if (!validation.success) {
			return {
				status: ActionStatus.VALIDATION_ERROR,
				message: "Validation échouée. Veuillez vérifier votre saisie.",
				validationErrors: validation.error.flatten().fieldErrors,
				inputs: rawData,
			};
		}

		const validatedData = validation.data;

		// 4. Recherche du groupe avec le code d'invitation
		const group = await prisma.group.findUnique({
			where: { code: validatedData.code },
			include: {
				memberships: {
					select: {
						userId: true,
						status: true,
					},
				},
			},
		});

		if (!group) {
			return {
				status: ActionStatus.NOT_FOUND,
				message: "Code d'invitation invalide. Vérifiez le code et réessayez.",
			};
		}

		// 5. Vérifier si l'utilisateur est déjà membre
		const existingMembership = group.memberships.find(
			(membership) => membership.userId === userId
		);

		if (existingMembership) {
			if (existingMembership.status === "ACTIVE") {
				return {
					status: ActionStatus.CONFLICT,
					message: "Vous êtes déjà membre de ce groupe.",
				};
			}
			// Si le membership existe mais n'est pas actif, on le réactive
			await prisma.membership.updateMany({
				where: {
					groupId: group.id,
					userId: userId,
				},
				data: {
					status: "ACTIVE",
					role: "MEMBER",
				},
			});
		} else {
			// 6. Vérifier si le groupe a atteint sa capacité maximale
			const activeMembersCount = group.memberships.filter(
				(membership) => membership.status === "ACTIVE"
			).length;

			if (activeMembersCount >= group.maxMembers) {
				return {
					status: ActionStatus.CONFLICT,
					message: "Ce groupe a atteint sa capacité maximale.",
				};
			}

			// 7. Créer le nouveau membership
			await prisma.membership.create({
				data: {
					groupId: group.id,
					userId: userId,
					role: "MEMBER",
					status: "ACTIVE",
				},
			});
		}

		// 8. Retour du succès
		return {
			status: ActionStatus.SUCCESS,
			message: `Vous avez rejoint le groupe "${group.name}" avec succès !`,
			data: {
				groupId: group.id,
				groupName: group.name,
				code: group.code,
			},
		};
	} catch (error) {
		console.error("[JOIN_GROUP]", error);
		return {
			status: ActionStatus.ERROR,
			message:
				"Une erreur est survenue lors de la tentative de rejoindre le groupe. Veuillez réessayer.",
		};
	}
};
