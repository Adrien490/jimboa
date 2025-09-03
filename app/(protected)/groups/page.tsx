import { api } from "@/convex/_generated/api";
import { getServerAuth } from "@/lib/server-auth";
import { GroupList } from "@/shared/components/group-list";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { SearchForm } from "@/shared/components/search-form/search-form";
import { Toolbar } from "@/shared/components/toolbar";
import { preloadQuery } from "convex/nextjs";
import { Plus, User, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface GroupsPageProps {
	searchParams: Promise<{ search?: string }>;
}

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
	const { userId } = await getServerAuth();
	if (!userId) redirect("/");

	const resolvedSearchParams = await searchParams;
	const search = resolvedSearchParams?.search;

	// Obtenir le token pour preloadQuery
	if (!userId) redirect("/");
	// Précharger les groupes avec le token
	const preloadedGroups = await preloadQuery(api.groups.getMy, { search });

	return (
		<>
			<PageHeader
				title="Vos groupes"
				description="Gérez vos groupes et invitez vos gars sûrs"
				action={
					<Link
						href="/profile"
						className="flex items-center justify-center w-10 h-10 rounded-xl bg-card/60 backdrop-blur-md border border-border/50 hover:bg-card/80 hover:border-border/70 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group"
						title="Voir le profil"
					>
						<User className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
					</Link>
				}
			/>

			<PageContainer>
				{/* Search Bar */}
				<div className="mb-6 flex-shrink-0">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-50" />
						<div className="relative flex items-center space-x-3 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm">
							<div className="flex-1">
								<SearchForm
									paramName="search"
									placeholder="Rechercher vos groupes..."
									className="border-0 bg-transparent p-0 focus:ring-0 text-sm"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Groups Content */}
				<div className="flex-1 min-h-0">
					<GroupList preloadedGroups={preloadedGroups} />
				</div>
			</PageContainer>

			{/* Toolbar with Action Buttons */}
			<Toolbar>
				<Link href="/groups/join" className="flex-1">
					<div className="group relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="relative flex items-center justify-center space-x-2 p-3 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
							<Users className="w-4 h-4 text-primary" />
							<span className="font-body text-xs text-card-foreground">
								Rejoindre
							</span>
						</div>
					</div>
				</Link>

				<Link href="/groups/new" className="flex-1">
					<div className="group relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-sm opacity-50" />
						<div className="relative flex items-center justify-center space-x-2 p-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 shadow-lg">
							<Plus className="w-4 h-4 text-white" />
							<span className="font-body text-xs font-medium text-white">
								Créer un groupe
							</span>
						</div>
					</div>
				</Link>
			</Toolbar>
		</>
	);
}
