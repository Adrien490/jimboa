"use client";

import { GetGroupsReturn } from "@/domains/group/features/get-groups";
import { Badge } from "@/shared/components/ui/badge";
import { Heart, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use } from "react";

export function GroupList({
	getGroupsPromise,
}: {
	getGroupsPromise: Promise<GetGroupsReturn>;
}) {
	const groups = use(getGroupsPromise);
	const searchParams = useSearchParams();
	const hasSearch = searchParams.get("search");

	if (!groups.length) {
		// État différent selon s'il y a une recherche ou non
		if (hasSearch) {
			return (
				<div className="flex flex-col items-center justify-center text-center py-12 px-4">
					{/* Visual Element */}
					<div className="relative mb-8">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-destructive/20 to-destructive/30 flex items-center justify-center shadow-lg">
							<Users className="w-8 h-8 text-destructive" />
						</div>
						<div className="absolute -inset-2 bg-gradient-to-r from-destructive/20 to-destructive/30 rounded-full blur-lg opacity-50" />
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
						Aucun groupe pour l&apos;instant
					</h3>
					<p className="text-sm text-muted-foreground max-w-sm">
						Créez votre premier groupe ou rejoignez-en un avec un code
						d&apos;invitation !
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
							<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative flex items-center justify-center space-x-3 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
								<Users className="w-5 h-5 text-primary" />
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
					key={group?.id}
					href={`/groups/${group?.id}`}
					className="block group"
				>
					<div className="relative">
						{/* Glow effect background - couleur selon le type */}
						<div
							className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${
								group?.type === "COUPLE"
									? "bg-gradient-to-r from-red-400/10 to-red-600/10"
									: "bg-gradient-to-r from-primary/10 to-primary/20"
							}`}
						/>

						<div
							className={`relative flex items-center space-x-4 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer ${
								group?.type === "COUPLE"
									? "hover:bg-red-50/50 dark:hover:bg-red-950/20"
									: ""
							}`}
						>
							{/* Avatar avec couleurs spécifiques au type */}
							<div
								className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg ${
									group?.type === "COUPLE"
										? "bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50"
										: "bg-gradient-to-r from-primary/20 to-primary/30"
								}`}
							>
								{group?.imageUrl ? (
									<Image
										src={group.imageUrl}
										alt={`Image du groupe ${group.name}`}
										width={56}
										height={56}
										className="w-full h-full object-cover rounded-xl"
									/>
								) : (
									<>
										{group?.type === "COUPLE" ? (
											<Heart className="w-7 h-7 text-red-600 dark:text-red-400" />
										) : (
											<Users className="w-7 h-7 text-primary" />
										)}
									</>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="text-base font-heading-semibold text-card-foreground truncate">
										{group?.name}
									</h3>
									{/* Badge du type de groupe */}
									<Badge
										variant={
											group?.type === "COUPLE" ? "destructive" : "default"
										}
										className={
											group?.type === "COUPLE"
												? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
												: ""
										}
									>
										{group?.type === "COUPLE" ? "Couple" : "Amis"}
									</Badge>
								</div>
								<p className="text-xs font-mono font-medium text-muted-foreground">
									Code : {group?.code}
								</p>
							</div>

							{/* Indicateur coloré selon le type */}
							<div
								className={`w-2 h-2 rounded-full opacity-60 ${
									group?.type === "COUPLE" ? "bg-red-500" : "bg-primary"
								}`}
							/>
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}
