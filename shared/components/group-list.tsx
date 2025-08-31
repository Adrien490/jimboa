"use client";

import { api } from "@/convex/_generated/api";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Copy, Users } from "lucide-react";
import Image from "next/image";

export function GroupList({
	preloadedGroups,
}: {
	preloadedGroups: Preloaded<typeof api.groups.getMy>;
}) {
	const groups = usePreloadedQuery(preloadedGroups);

	const copyCode = (code: string) => {
		navigator.clipboard.writeText(code);
	};

	if (!groups?.length) {
		return (
			<div className="text-center py-12">
				<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-lg font-medium text-foreground mb-2">
					Aucun groupe pour l&apos;instant
				</h3>
				<p className="text-muted-foreground">
					Créez votre premier groupe pour commencer à inviter vos amis
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{groups.map((group) => (
				<Card key={group?._id} className="hover:bg-accent/50 transition-colors">
					<CardHeader>
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
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
								<div className="flex items-center justify-between gap-3">
									<div className="min-w-0 flex-1">
										<CardTitle className="text-base sm:text-lg truncate">
											{group?.name}
										</CardTitle>
										<CardDescription className="text-sm font-mono">
											{group?.code}
										</CardDescription>
									</div>
									<CardAction className="flex-shrink-0">
										<button
											onClick={() => copyCode(group?.code || "")}
											className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
											title="Copier le code"
										>
											<Copy className="w-5 h-5" />
										</button>
									</CardAction>
								</div>
							</div>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
