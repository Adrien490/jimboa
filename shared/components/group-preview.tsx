"use client";

import { Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface GroupPreviewProps {
	code: string;
	className?: string;
}

interface GroupInfo {
	name: string;
	type: "friends" | "couple";
	memberCount: number;
	maxMembers?: number;
	createdAt: number;
	isPublic: boolean;
}

export function GroupPreview({ code, className }: GroupPreviewProps) {
	const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchGroupInfo = async () => {
			try {
				setLoading(true);
				setError(null);

				// Utilisation de l'HTTP Action pour récupérer les infos publiques du groupe
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/api/groups/info?code=${encodeURIComponent(code)}`
				);

				if (!response.ok) {
					if (response.status === 404) {
						setError("Groupe introuvable");
					} else {
						setError("Erreur lors du chargement");
					}
					return;
				}

				const data = await response.json();
				setGroupInfo(data);
			} catch (err) {
				console.error(
					"Erreur lors de la récupération des infos du groupe:",
					err
				);
				setError("Erreur de connexion");
			} finally {
				setLoading(false);
			}
		};

		if (code) {
			fetchGroupInfo();
		}
	}, [code]);

	if (loading) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div className="animate-pulse space-y-4">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error || !groupInfo) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<div className="text-center text-gray-500">
						<p>{error || "Impossible de charger les informations du groupe"}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const typeLabel = groupInfo.type === "couple" ? "Couple" : "Amis";
	const typeColor =
		groupInfo.type === "couple"
			? "bg-pink-100 text-pink-800"
			: "bg-blue-100 text-blue-800";

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl">{groupInfo.name}</CardTitle>
					<Badge className={typeColor}>{typeLabel}</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<Users className="w-4 h-4" />
						<span>
							{groupInfo.memberCount} membre
							{groupInfo.memberCount > 1 ? "s" : ""}
							{groupInfo.maxMembers && ` / ${groupInfo.maxMembers}`}
						</span>
					</div>

					<div className="flex items-center gap-2 text-sm text-gray-600">
						<Calendar className="w-4 h-4" />
						<span>
							Créé le{" "}
							{new Date(groupInfo.createdAt).toLocaleDateString("fr-FR")}
						</span>
					</div>

					<div className="pt-2">
						<p className="text-sm text-gray-500">
							Code d'invitation :{" "}
							<code className="bg-gray-100 px-2 py-1 rounded">{code}</code>
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Hook personnalisé pour vérifier le statut de l'API
export function useApiHealth() {
	const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
	const [lastCheck, setLastCheck] = useState<Date | null>(null);

	const checkHealth = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/health`
			);
			const data = await response.json();
			setIsHealthy(response.ok && data.status === "healthy");
			setLastCheck(new Date());
		} catch {
			setIsHealthy(false);
			setLastCheck(new Date());
		}
	};

	useEffect(() => {
		checkHealth();
		// Vérifier toutes les 5 minutes
		const interval = setInterval(checkHealth, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	return { isHealthy, lastCheck, checkHealth };
}
