"use client";

import { api } from "@/convex/_generated/api";
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
				<div className="flex flex-col items-center justify-center text-center py-12 px-4">
					{/* Visual Element */}
					<div className="relative mb-8">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center shadow-lg">
							<Users className="w-8 h-8 text-orange-500" />
						</div>
						<div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-lg opacity-50" />
					</div>

					{/* Content */}
					<div className="mb-8">
						<h3 className="text-lg font-heading-bold text-foreground mb-2">
							Aucun groupe trouvé
						</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							Aucun groupe ne correspond à votre recherche. Essayez un autre
							terme ou créez un nouveau groupe !
						</p>
					</div>

					{/* Action */}
					<Link href="/groups/new" className="block w-full max-w-sm">
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-sm opacity-50" />
							<div className="relative flex items-center justify-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 shadow-lg">
								<Plus className="w-5 h-5 text-white" />
								<span className="font-body text-sm font-medium text-white">
									Créer un groupe
								</span>
							</div>
						</div>
					</Link>
				</div>
			);
		}

		return (
			<div className="flex flex-col items-center justify-center text-center py-12 px-4">
				{/* Visual Element */}
				<div className="relative mb-8">
					<div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center shadow-lg">
						<Users className="w-10 h-10 text-primary" />
					</div>
					<div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl opacity-50" />
				</div>

				{/* Content */}
				<div className="mb-8">
					<h3 className="text-xl font-heading-bold text-foreground mb-2">
						Aucun groupe pour l'instant
					</h3>
					<p className="text-sm text-muted-foreground max-w-sm">
						Créez votre premier groupe ou rejoignez-en un avec un code
						d'invitation !
					</p>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3 w-full max-w-sm">
					<Link href="/groups/new" className="block">
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-sm opacity-50" />
							<div className="relative flex items-center justify-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 shadow-lg">
								<Plus className="w-5 h-5 text-white" />
								<span className="font-body text-sm font-medium text-white">
									Créer un groupe
								</span>
							</div>
						</div>
					</Link>

					<Link href="/groups/join" className="block">
						<div className="group relative">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative flex items-center justify-center space-x-3 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
								<Users className="w-5 h-5 text-blue-500" />
								<span className="font-body text-sm text-card-foreground">
									Rejoindre un groupe
								</span>
							</div>
						</div>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 overflow-y-auto max-h-full">
			{groups.map((group) => (
				<Link
					key={group?._id}
					href={`/groups/${group?._id}`}
					className="block group"
				>
					<div className="relative">
						{/* Glow effect background */}
						<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

						<div className="relative flex items-center space-x-4 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer">
							<div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
								{group?.imageUrl ? (
									<Image
										src={group.imageUrl}
										alt={`Image du groupe ${group.name}`}
										width={56}
										height={56}
										className="w-full h-full object-cover rounded-xl"
									/>
								) : (
									<Users className="w-7 h-7 text-primary" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-base font-heading-semibold text-card-foreground truncate mb-1">
									{group?.name}
								</h3>
								<p className="text-xs font-mono font-medium text-muted-foreground">
									Code : {group?.code}
								</p>
							</div>
							<div className="w-2 h-2 bg-primary rounded-full opacity-60" />
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
