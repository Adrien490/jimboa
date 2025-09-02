import { api } from "@/convex/_generated/api";
import { GroupList } from "@/shared/components/group-list";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { SearchForm } from "@/shared/components/search-form/search-form";
import { Toolbar } from "@/shared/components/toolbar";
import { Button } from "@/shared/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { Plus, User, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
	const session = await auth();
	if (!session.userId) redirect("/");

	const token = (await session.getToken({ template: "convex" })) ?? undefined;
	const preloadedGroups = await preloadQuery(api.groups.getMy, {}, { token });

	return (
		<>
			<PageHeader
				title="Vos groupes"
				description="Gérez vos groupes et invitez vos gars sûrs"
				action={
					<Link
						href="/profile"
						className="relative group p-3 rounded-xl bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300 hover:shadow-lg"
						title="Voir le profil"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
						<User className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors relative z-10" />
					</Link>
				}
			/>

			<PageContainer className="min-h-[100dvh] relative overflow-hidden pt-20 sm:pt-24 pb-24 sm:pb-28">
				{/* Main Content */}
				<div className="relative z-10 flex flex-col min-h-[calc(100dvh-11rem)] sm:min-h-[calc(100dvh-13rem)]">
					{/* Groups List */}
					<div className="flex-1">
						<GroupList preloadedGroups={preloadedGroups} />
					</div>

					{/* Bottom Safe Area Spacer for Mobile */}
					<div className="h-safe-bottom sm:h-0" />
				</div>
			</PageContainer>

			{/* Toolbar with Search and Action Buttons */}
			<Toolbar>
				<SearchForm
					paramName="search"
					placeholder="Rechercher..."
					className="flex-1 min-w-0"
				/>

				<Link href="/groups/join">
					<Button
						size="sm"
						variant="outline"
						className="h-10 w-10 p-0 rounded-xl bg-card/60 backdrop-blur-md border-2 border-border/50 text-foreground shadow-xl hover:bg-card/80 hover:border-border/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
						title="Rejoindre un groupe"
					>
						<Users className="w-4 h-4" />
					</Button>
				</Link>

				<Link href="/groups/new">
					<Button
						size="sm"
						className="h-10 w-10 p-0 rounded-xl bg-primary backdrop-blur-md border-2 border-primary/50 text-white shadow-xl hover:bg-primary/80 hover:border-primary/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
						title="Créer un groupe"
					>
						<Plus className="w-4 h-4" />
					</Button>
				</Link>
			</Toolbar>
		</>
	);
}
