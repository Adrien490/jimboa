import { api } from "@/convex/_generated/api";
import { GroupList } from "@/shared/components/group-list";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { buttonVariants } from "@/shared/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { Plus, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
	const session = await auth();
	if (!session.userId) redirect("/");

	const token = (await session.getToken({ template: "convex" })) ?? undefined;
	const preloadedGroups = await preloadQuery(api.groups.getMy, {}, { token });

	return (
		<PageContainer>
			<PageHeader
				title="Vos groupes"
				description="Gérez vos groupes et invitez vos amis"
				action={
					<Link
						href="/profile"
						className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
						title="Voir le profil"
					>
						<User className="w-5 h-5" />
					</Link>
				}
			/>
			<Link
				href="/groups/new"
				className={buttonVariants({ variant: "default" })}
			>
				<Plus className="w-4 h-4 mr-2" />
				Créer un groupe
			</Link>
			<GroupList preloadedGroups={preloadedGroups} />
		</PageContainer>
	);
}
