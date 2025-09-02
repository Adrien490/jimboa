"use client";

import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function GroupList({
	preloadedGroups,
}: {
	preloadedGroups: Preloaded<typeof api.groups.getMy>;
}) {
	const groups = usePreloadedQuery(preloadedGroups);
	const searchParams = useSearchParams();
	const hasSearch = searchParams.get("search");

	if (!groups?.length) {
		// État différent selon s'il y a une recherche ou non
		if (hasSearch) {
			return (
				<EmptyState
					title="Aucun groupe trouvé"
					description={
						<>
							Aucun groupe ne correspond à votre recherche.
							<br />
							Essayez un autre terme ou créez un nouveau groupe !
						</>
					}
					action={
						<Link href="/groups/new">
							<Button size="lg" className="h-12 px-6 rounded-xl shadow-lg">
								<Plus className="w-5 h-5 mr-2" />
								Créer un groupe
							</Button>
						</Link>
					}
				/>
			);
		}

		return (
			<EmptyState
				title="Aucun groupe pour l'instant"
				description={
					<>
						Créez votre premier groupe !
						<br />
						C&apos;est parti !
					</>
				}
				action={
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Link href="/groups/new">
							<Button size="lg" className="h-12 px-6 rounded-xl shadow-lg">
								<Plus className="w-5 h-5 mr-2" />
								Créer un groupe
							</Button>
						</Link>
						<Link href="/groups/join">
							<Button
								variant="outline"
								size="lg"
								className="h-12 px-6 rounded-xl shadow-md"
							>
								<Users className="w-5 h-5 mr-2" />
								Rejoindre un groupe
							</Button>
						</Link>
					</div>
				}
			/>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{groups.map((group) => (
				<Link key={group?._id} href={`/groups/${group?._id}`} className="block">
					<div className="relative">
						<Card className="relative backdrop-blur-sm border rounded-2xl sm:rounded-3xl shadow-md cursor-pointer transition-transform duration-200 active:scale-95">
							<CardHeader>
								<div className="flex items-center space-x-3 sm:space-x-4">
									<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
										{group?.imageUrl ? (
											<Image
												src={group.imageUrl}
												alt={`Image du groupe ${group.name}`}
												width={80}
												height={80}
												className="w-full h-full object-cover rounded-xl"
											/>
										) : (
											<Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<CardTitle className="text-base sm:text-lg font-heading-semibold text-card-foreground truncate mb-0.5">
											{group?.name}
										</CardTitle>
										<CardDescription className="text-xs sm:text-sm font-mono font-medium text-muted-foreground">
											Code : {group?.code}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
						</Card>
					</div>
				</Link>
			))}
		</div>
	);
}
