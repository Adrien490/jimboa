"use client";

import { api } from "@/convex/_generated/api";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Users } from "lucide-react";
import Image from "next/image";

interface GroupContentProps {
	preloadedGroup: Preloaded<typeof api.groups.get>;
}

export function GroupContent({ preloadedGroup }: GroupContentProps) {
	const group = usePreloadedQuery(preloadedGroup);

	if (!group) {
		return (
			<>
				<PageHeader
					showBackButton
					title="Groupe introuvable"
					description="Ce groupe n'existe pas ou vous n'y avez pas accès"
				/>
				<PageContainer withContainer className="pt-20 sm:pt-24 pb-8">
					<Card>
						<CardContent className="pt-6">
							<p className="text-muted-foreground text-center">
								Groupe introuvable
							</p>
						</CardContent>
					</Card>
				</PageContainer>
			</>
		);
	}

	return (
		<>
			<PageHeader
				showBackButton
				title={group.name}
				description="Détails du groupe"
			/>

			<PageContainer withContainer className="pt-20 sm:pt-24 pb-8">
				<Card>
					<CardHeader>
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
								{group.imageId ? (
									<Image
										src={group.imageId}
										alt={`Image du groupe ${group.name}`}
										width={64}
										height={64}
										className="w-full h-full object-cover rounded-xl"
									/>
								) : (
									<Users className="w-8 h-8 text-primary" />
								)}
							</div>
							<div>
								<CardTitle className="text-xl">{group.name}</CardTitle>
								<p className="text-sm text-muted-foreground font-mono">
									Code : {group.code}
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<h3 className="font-medium text-sm text-muted-foreground mb-2">
									Informations
								</h3>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">
											Notification :
										</span>
										<p className="font-medium">
											{String(group.dailyHour).padStart(2, "0")}:
											{String(group.dailyMinute).padStart(2, "0")}
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">Max membres :</span>
										<p className="font-medium">{group.maxMembers}</p>
									</div>
								</div>
							</div>
							<div>
								<span className="text-muted-foreground text-sm">Créé le :</span>
								<p className="font-medium">
									{new Date(group.createdAt).toLocaleDateString("fr-FR", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</PageContainer>
		</>
	);
}
