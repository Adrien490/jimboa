"use client";

import { api } from "@/convex/_generated/api";
import { EmptyState } from "@/shared/components/empty-state";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Users } from "lucide-react";
import Image from "next/image";

export function GroupList({
	preloadedGroups,
}: {
	preloadedGroups: Preloaded<typeof api.groups.getMy>;
}) {
	const groups = usePreloadedQuery(preloadedGroups);

	if (!groups?.length) {
		return (
			<EmptyState
				icon={Users}
				title="Aucun groupe pour l'instant"
				description={<>Créez votre premier groupe pour commencer :)</>}
			/>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{groups.map((group) => (
				<div key={group?._id} className="group relative smooth-hover">
					{/* Glow effect */}
					<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

					<Card className="relative bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300 hover:shadow-xl rounded-2xl sm:rounded-3xl">
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
			))}
		</div>
	);
}
