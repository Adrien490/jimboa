import { Prisma } from "@/lib/generated/prisma";
import { z } from "zod";
import { GET_GROUPS_DEFAULT_SELECT } from "../constants";
import { getGroupsSchema } from "../schemas";

export type GetGroupsReturn = Array<
	Prisma.GroupGetPayload<{
		select: typeof GET_GROUPS_DEFAULT_SELECT;
	}>
>;

export type GetGroupsParams = z.infer<typeof getGroupsSchema>;

export type GroupWithDetails = Prisma.GroupGetPayload<{
	select: typeof GET_GROUPS_DEFAULT_SELECT;
}>;

export type GroupMembershipWithUser = {
	id: string;
	role: string;
	status: string;
	nickname?: string | null;
	displayName?: string | null;
	avatarUrl?: string | null;
	createdAt: Date;
	user: {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
};
