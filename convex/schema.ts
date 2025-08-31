// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// --- Groupes ---
	groups: defineTable({
		name: v.string(),
		code: v.string(), // unique logique (contrôle via index/mutation)
		ownerId: v.string(), // Clerk userId (owner formel du groupe)
		imageId: v.optional(v.id("_storage")),
		dailyHour: v.number(), // 0..23
		dailyMinute: v.number(), // 0..59
		maxMembers: v.number(),
		createdAt: v.number(),
	})
		.index("by_code", ["code"])
		.index("by_owner", ["ownerId"])
		.index("by_name", ["name"]),

	// --- Adhésions ---
	memberships: defineTable({
		groupId: v.id("groups"),
		userId: v.string(), // Clerk userId
		role: v.union(v.literal("admin"), v.literal("member")),
		status: v.optional(
			v.union(v.literal("active"), v.literal("left"), v.literal("banned"))
		),
		nickname: v.optional(v.string()),
		displayName: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("by_group", ["groupId"])
		.index("by_user_group", ["userId", "groupId"])
		.index("by_group_role", ["groupId", "role"]),

	// --- Prompts (un par jour et par groupe) ---
	prompts: defineTable({
		groupId: v.id("groups"),
		localDate: v.string(), // "YYYY-MM-DD" (selon groups.timezone si présent)
		type: v.union(
			v.literal("question"),
			v.literal("vote"),
			v.literal("challenge")
		),
		text: v.string(),
		options: v.optional(v.array(v.string())),
		opensAt: v.number(), // UTC ms
		closesAt: v.optional(v.number()), // UTC ms
		status: v.union(
			v.literal("scheduled"),
			v.literal("open"),
			v.literal("closed"),
			v.literal("cancelled")
		),
		createdBy: v.string(), // Clerk userId
		optionCounts: v.optional(v.array(v.number())), // aligné sur options.length
		resultsFinalizedAt: v.optional(v.number()),
		deletedAt: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_group_date", ["groupId", "localDate"])
		.index("by_group_status", ["groupId", "status"])
		.index("by_group_opens", ["groupId", "opensAt"])
		.index("open_by_group", ["groupId", "status", "opensAt"])
		.index("by_group_closes", ["groupId", "closesAt"])
		.index("by_group_date_type", ["groupId", "localDate", "type"]),

	// --- Submissions ---
	submissions: defineTable({
		promptId: v.id("prompts"),
		userId: v.string(), // Clerk userId
		textAnswer: v.optional(v.string()),
		optionIndex: v.optional(v.number()),
		voteTargetUserId: v.optional(v.string()),
		proofId: v.optional(v.id("_storage")),
		isEdited: v.optional(v.boolean()),
		editedAt: v.optional(v.number()),
		deletedAt: v.optional(v.number()),
		flagged: v.optional(v.boolean()),
		moderationState: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("approved"),
				v.literal("rejected")
			)
		),
		createdAt: v.number(),
		updatedAt: v.optional(v.number()),
	})
		.index("by_prompt", ["promptId"])
		.index("by_user_prompt", ["userId", "promptId"])
		.index("by_prompt_option", ["promptId", "optionIndex"])
		.index("by_prompt_vote_target", ["promptId", "voteTargetUserId"])
		.index("by_prompt_state", ["promptId", "moderationState"]),
});
