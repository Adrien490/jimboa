import { z } from "zod";
import { getGroupsSchema } from "../schemas";

export type GetGroupsParams = z.infer<typeof getGroupsSchema>;

// Types simplifiés pour les données Supabase
export type GetGroupsReturn = Array<{
	id: string;
	name: string;
	code: string;
	type: string;
	image_url: string | null;
	daily_hour: number | null;
	daily_minute: number | null;
	max_members: number | null;
	created_at: string;
	deleted_at: string | null;
	owner_id: string;
	owner: {
		id: string;
		name: string | null;
		email: string | null;
		avatar_url: string | null;
	} | null;
	memberships: Array<{
		id: string;
		role: string;
		status: string;
		nickname?: string | null;
		display_name?: string | null;
		avatar_url?: string | null;
		created_at: string;
		user: {
			id: string;
			name: string | null;
			email: string | null;
			avatar_url: string | null;
		};
	}>;
}>;
