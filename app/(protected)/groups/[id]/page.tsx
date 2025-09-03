import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getServerAuth } from "@/lib/server-auth";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { GroupContent } from "./group-content";

interface GroupPageProps {
	params: Promise<{ id: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
	const { userId } = await getServerAuth();
	if (!userId) redirect("/");

	const resolvedParams = await params;
	const groupId = resolvedParams.id as Id<"groups">;

	try {
		// Précharger le groupe (Convex gérera l'authentification automatiquement)
		const preloadedGroup = await preloadQuery(api.groups.get, { id: groupId });

		return <GroupContent preloadedGroup={preloadedGroup} />;
	} catch (error) {
		console.error("Erreur lors du chargement du groupe:", error);
		redirect("/groups");
	}
}
