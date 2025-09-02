import { api } from "@/convex/_generated/api";
import { GroupList } from "@/shared/components/group-list";
import { PageContainer } from "@/shared/components/page-container";
import { SearchForm } from "@/shared/components/search-form/search-form";
import { Toolbar } from "@/shared/components/toolbar";
import { Button } from "@/shared/components/ui/button";
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
		<>
			<PageContainer className="min-h-[100dvh] relative overflow-hidden">
				{/* Main Content */}
				<div className="relative z-10 flex flex-col min-h-[100dvh]">
					{/* Header with Profile Action */}
					<div className="flex items-center justify-between mb-6 sm:mb-8">
						<div className="relative">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading-bold text-foreground tracking-tight">
								Vos groupes
							</h1>
							<div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg blur-lg opacity-50" />
						</div>

						<Link
							href="/profile"
							className="relative group p-3 rounded-xl bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300 hover:shadow-lg"
							title="Voir le profil"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
							<User className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors relative z-10" />
						</Link>
					</div>

					{/* Groups List */}
					<div className="flex-1">
						<GroupList preloadedGroups={preloadedGroups} />
					</div>

					{/* Bottom Safe Area Spacer for Mobile */}
					<div className="h-safe-bottom sm:h-0" />
				</div>
			</PageContainer>

			{/* Toolbar with Search and Create Group Button */}
			<Toolbar>
				<SearchForm
					paramName="search"
					placeholder="Rechercher..."
					className="flex-1"
				/>

				<Link href="/groups/new">
					<Button className="h-12 px-3 rounded-xl bg-primary/40 backdrop-blur-md border border-primary/30 text-primary-foreground font-heading-semibold text-sm shadow-lg hover:bg-primary/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">
						<Plus className="w-4 h-4 mr-1" />
						Créer
					</Button>
				</Link>
			</Toolbar>
		</>
	);
}
