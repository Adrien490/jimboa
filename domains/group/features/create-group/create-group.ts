"use server";

import { headers } from "next/headers";
import z from "zod";

import { auth } from "@/auth";
import { prisma } from "@/shared/lib/prisma";
import { ActionStatus, ServerAction } from "@/shared/types/server-action";
import { createGroupSchema } from "./create-group-schema";

// Fonction pour générer un code aléatoire unique
function randomCode(len = 6) {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // évite les caractères ambigus
	let out = "";
	for (let i = 0; i < len; i++)
		out += chars[Math.floor(Math.random() * chars.length)];
	return out;
}

export const createGroup: ServerAction<
	z.infer<typeof createGroupSchema>,
	typeof createGroupSchema
> = async (_, formData) => {
	try {
		// 1. Vérification de l'authentification
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				status: ActionStatus.ERROR,
				message: "Vous devez être connecté pour créer un groupe.",
			};
		}

		const userId = session.user.id;

		// 2. Extraction et validation des données du formulaire
		const rawData = {
			name: formData.get("name") as string,
			type: formData.get("type") as "friends" | "couple",
			imageUrl: formData.get("imageUrl") as string,
		};

		// 3. Validation des données avec Zod
		const validation = createGroupSchema.safeParse(rawData);
		if (!validation.success) {
			return {
				status: ActionStatus.VALIDATION_ERROR,
				message: "Validation échouée. Veuillez vérifier votre saisie.",
				validationErrors: validation.error.flatten().fieldErrors,
				inputs: rawData,
			};
		}

		const validatedData = validation.data;

		// 4. Génération d'un code unique pour le groupe
		let code = randomCode(6);
		for (let i = 0; i < 5; i++) {
			const existing = await prisma.group.findUnique({
				where: { code },
			});
			if (!existing) break;
			code = randomCode(6 + i); // augmente la longueur en cas de conflit
		}

		// 5. Gestion de l'URL de l'image (si fournie)
		const imageUrl = validatedData.imageUrl || null;

		// 6. Création du groupe en base de données
		let group;
		try {
			group = await prisma.group.create({
				data: {
					name: validatedData.name,
					code,
					ownerId: userId,
					type: validatedData.type === "friends" ? "FRIENDS" : "COUPLE",
					imageUrl,
					dailyHour: 9, // 9h par défaut
					dailyMinute: 0, // 0 minute par défaut
					maxMembers: validatedData.type === "couple" ? 2 : 50,
				},
			});
		} catch (dbError) {
			console.error("Erreur lors de la création du groupe:", dbError);
			return {
				status: ActionStatus.ERROR,
				message: "Erreur lors de la création du groupe. Veuillez réessayer.",
			};
		}

		// 7. Ajout du créateur comme membre propriétaire du groupe
		try {
			await prisma.membership.create({
				data: {
					groupId: group.id,
					userId: userId,
					role: "OWNER",
					status: "ACTIVE",
				},
			});
		} catch (membershipError) {
			console.error("Erreur lors de l'ajout du membership:", membershipError);

			// En cas d'erreur, on supprime le groupe créé pour maintenir la cohérence
			await prisma.group
				.delete({
					where: { id: group.id },
				})
				.catch(() => {});

			return {
				status: ActionStatus.ERROR,
				message: "Erreur lors de la création du groupe. Veuillez réessayer.",
			};
		}

		// 8. Retour du succès avec les données du groupe créé
		return {
			status: ActionStatus.SUCCESS,
			message: `Le groupe "${group.name}" a été créé avec succès ! Code d'invitation : ${group.code}`,
			data: {
				id: group.id,
				name: group.name,
				code: group.code,
				type: validatedData.type,
			},
		};
	} catch (error) {
		console.error("[CREATE_GROUP]", error);
		return {
			status: ActionStatus.ERROR,
			message:
				"Une erreur est survenue lors de la création du groupe. Veuillez réessayer.",
		};
	}
};
