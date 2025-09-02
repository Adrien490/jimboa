import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { GroupContent } from "./group-content";

interface GroupPageProps {
	params: Promise<{ id: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
	const session = await auth();
	if (!session.userId) redirect("/");

	const resolvedParams = await params;
	const groupId = resolvedParams.id as Id<"groups">;

	const token = (await session.getToken({ template: "convex" })) ?? undefined;

	try {
		const preloadedGroup = await preloadQuery(
			api.groups.get,
			{ id: groupId },
			{ token }
		);

		return <GroupContent preloadedGroup={preloadedGroup} />;
	} catch (error) {
		console.error("Erreur lors du chargement du groupe:", error);
		redirect("/groups");
	}
}
