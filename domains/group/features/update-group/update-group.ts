"use server";

import { headers } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/shared/lib/prisma";
import { ActionStatus, ServerAction } from "@/shared/types/server-action";
import { updateGroupSchema } from "./update-group-schema";

type UpdateGroupData = {
	id: string;
	name: string;
	imageUrl?: string | null;
};

export const updateGroup: ServerAction<
	UpdateGroupData,
	typeof updateGroupSchema
> = async (_, formData) => {
	try {
		// 1. Vérification de l'authentification
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				status: ActionStatus.ERROR,
				message: "Vous devez être connecté pour modifier un groupe.",
			};
		}

		const userId = session.user.id;

		// 2. Extraction et validation des données du formulaire
		const rawData = {
			groupId: formData.get("groupId") as string,
			name: formData.get("name") as string,
			imageUrl: formData.get("imageUrl") as string,
		};

		// 3. Validation des données avec Zod
		const validation = updateGroupSchema.safeParse(rawData);
		if (!validation.success) {
			return {
				status: ActionStatus.VALIDATION_ERROR,
				message: "Validation échouée. Veuillez vérifier votre saisie.",
				validationErrors: validation.error.flatten().fieldErrors,
				inputs: rawData,
			};
		}

		const validatedData = validation.data;

		// 4. Vérification que le groupe existe et que l'utilisateur a les droits
		const group = await prisma.group.findUnique({
			where: { id: validatedData.groupId },
			include: {
				memberships: {
					where: { userId: userId },
					select: { role: true, status: true },
				},
			},
		});

		if (!group) {
			return {
				status: ActionStatus.NOT_FOUND,
				message: "Groupe introuvable.",
			};
		}

		// 5. Vérification des permissions (seuls les propriétaires et admins peuvent modifier)
		const userMembership = group.memberships[0];
		if (!userMembership || userMembership.status !== "ACTIVE") {
			return {
				status: ActionStatus.FORBIDDEN,
				message: "Vous n'êtes pas membre de ce groupe.",
			};
		}

		if (!["OWNER", "ADMIN"].includes(userMembership.role)) {
			return {
				status: ActionStatus.FORBIDDEN,
				message: "Vous n'avez pas les permissions pour modifier ce groupe.",
			};
		}

		// 6. Gestion de l'URL de l'image (si fournie)
		const imageUrl = validatedData.imageUrl || null;

		// 7. Mise à jour du groupe en base de données
		let updatedGroup;
		try {
			updatedGroup = await prisma.group.update({
				where: { id: validatedData.groupId },
				data: {
					name: validatedData.name,
					imageUrl,
				},
				select: {
					id: true,
					name: true,
					imageUrl: true,
				},
			});

			return {
				status: ActionStatus.SUCCESS,
				message: `Le groupe "${updatedGroup.name}" a été mis à jour avec succès !`,
				data: {
					id: updatedGroup.id,
					name: updatedGroup.name,
					imageUrl: updatedGroup.imageUrl,
				},
			};
		} catch (dbError) {
			console.error("Erreur lors de la mise à jour du groupe:", dbError);
			return {
				status: ActionStatus.ERROR,
				message: "Erreur lors de la mise à jour du groupe. Veuillez réessayer.",
			};
		}
	} catch (error) {
		console.error("[UPDATE_GROUP]", error);
		return {
			status: ActionStatus.ERROR,
			message:
				"Une erreur est survenue lors de la mise à jour du groupe. Veuillez réessayer.",
		};
	}
};
