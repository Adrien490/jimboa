"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface Group {
	id: string;
	name: string;
	code: string;
	type: "FRIENDS" | "COUPLE";
	created_at: string;
}

export function RealtimeGroupList({
	initialGroups,
}: {
	initialGroups: Group[];
}) {
	const [groups, setGroups] = useState<Group[]>(initialGroups);
	const supabase = createClient();

	useEffect(() => {
		// Configuration du canal Realtime avec RLS
		const channel = supabase
			.channel("groups_realtime")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "groups",
				},
				(payload) => {
					console.log("Change reçu:", payload);

					switch (payload.eventType) {
						case "INSERT":
							setGroups((current) => [...current, payload.new as Group]);
							break;
						case "UPDATE":
							setGroups((current) =>
								current.map((group) =>
									group.id === payload.new.id ? (payload.new as Group) : group
								)
							);
							break;
						case "DELETE":
							setGroups((current) =>
								current.filter((group) => group.id !== payload.old.id)
							);
							break;
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Groupes (Temps réel)</h2>
			{groups.length === 0 ? (
				<p className="text-gray-500">Aucun groupe trouvé</p>
			) : (
				<div className="grid gap-4">
					{groups.map((group) => (
						<div
							key={group.id}
							className="border rounded-lg p-4 hover:shadow-md transition-shadow"
						>
							<h3 className="font-medium">{group.name}</h3>
							<p className="text-sm text-gray-600">Code: {group.code}</p>
							<p className="text-sm text-gray-600">Type: {group.type}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
