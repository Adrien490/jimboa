import { api } from "@/convex/_generated/api";
import { GroupList } from "@/shared/components/group-list";
import { PageContainer } from "@/shared/components/page-container";
import { Particles } from "@/shared/components/particles";
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
		<PageContainer className="min-h-[100dvh] relative overflow-hidden">
			<Particles />

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

				{/* Description */}
				<p className="text-base sm:text-lg font-body text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
					Gérez vos groupes et{" "}
					<span className="text-primary font-medium">
						invitez vos gars sûrs
					</span>
				</p>

				{/* Create Group Button */}
				<div className="mb-6 sm:mb-8">
					<Link
						href="/groups/new"
						className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-heading-semibold text-base sm:text-lg shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-0.5 active:translate-y-0"
					>
						{/* Glow effect */}
						<div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>

						<div className="relative flex items-center space-x-3">
							<Plus className="w-5 h-5 sm:w-6 sm:h-6" />
							<span>Créer un groupe</span>
						</div>
					</Link>
				</div>

				{/* Groups List */}
				<div className="flex-1">
					<GroupList preloadedGroups={preloadedGroups} />
				</div>

				{/* Bottom Safe Area Spacer for Mobile */}
				<div className="h-safe-bottom sm:h-0" />
			</div>

			{/* Floating Elements for Visual Interest */}
			<div className="absolute top-1/4 left-4 w-2 h-2 bg-primary rounded-full opacity-60 animate-bounce" />
			<div className="absolute top-1/3 right-8 w-1 h-1 bg-purple-500 rounded-full opacity-40 animate-pulse" />
			<div
				className="absolute bottom-1/4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-50 animate-bounce"
				style={{ animationDelay: "1s" }}
			/>
		</PageContainer>
	);
}
