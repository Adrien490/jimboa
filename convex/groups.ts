import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { betterAuthComponent } from "./auth";

function randomCode(len = 6) {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid ambiguous chars
	let out = "";
	for (let i = 0; i < len; i++)
		out += chars[Math.floor(Math.random() * chars.length)];
	return out;
}

// Generate upload URL for group image
export const generateUploadUrl = mutation({
	handler: async (ctx) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		return await ctx.storage.generateUploadUrl();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		type: v.union(v.literal("friends"), v.literal("couple")),
		imageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, { name, type, imageId }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		// Generate a unique invite code
		let code = randomCode(6);
		for (let i = 0; i < 5; i++) {
			const existing = await ctx.db
				.query("groups")
				.withIndex("by_code", (q) => q.eq("code", code))
				.unique();
			if (!existing) break;
			code = randomCode(6 + i); // backoff length
		}

		const groupId = await ctx.db.insert("groups", {
			name,
			code,
			ownerId: userId as string,
			type,
			imageId,
			dailyHour: 9, // 9h par défaut
			dailyMinute: 0, // 0 minute par défaut
			maxMembers: type === "couple" ? 2 : 50, // 2 pour couple, 50 pour amis par défaut
			createdAt: Date.now(),
		});

		// Add owner as a member with owner role
		await ctx.db.insert("memberships", {
			groupId,
			userId: userId as string,
			role: "owner",
			status: "active",
			createdAt: Date.now(),
		});

		return { groupId, code };
	},
});

export const joinWithCode = mutation({
	args: { code: v.string() },
	handler: async (ctx, { code }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const group = await ctx.db
			.query("groups")
			.withIndex("by_code", (q) => q.eq("code", code))
			.unique();
		if (!group) throw new Error("Invalid invite code");

		// No duplicate membership
		const existing = await ctx.db
			.query("memberships")
			.withIndex("by_user_group", (q) =>
				q.eq("userId", userId as string).eq("groupId", group._id)
			)
			.unique();
		if (!existing) {
			await ctx.db.insert("memberships", {
				groupId: group._id,
				userId: userId as string,
				role: "member",
				status: "active",
				createdAt: Date.now(),
			});
		}

		return { groupId: group._id };
	},
});

export const getMy = query({
	args: {
		search: v.optional(v.string()),
	},
	handler: async (ctx, { search }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) return [];

		const myMemberships = await ctx.db
			.query("memberships")
			.withIndex("by_user", (q) => q.eq("userId", userId as string))
			.collect();

		const groups = await Promise.all(
			myMemberships.map(async (m) => {
				const g = await ctx.db.get(m.groupId);
				if (!g || g.deletedAt) return null; // Exclure les groupes supprimés

				// Generate image URL if imageId exists
				const imageUrl = g.imageId ? await ctx.storage.getUrl(g.imageId) : null;

				return {
					_id: g._id,
					name: g.name,
					code: g.code,
					ownerId: g.ownerId,
					type: g.type || "friends", // Par défaut "friends" pour les anciens groupes
					imageUrl,
					dailyHour: g.dailyHour,
					dailyMinute: g.dailyMinute,
					maxMembers: g.maxMembers,
					createdAt: g.createdAt,
				};
			})
		);

		// Filter groups based on search term
		const filteredGroups = groups.filter(Boolean);
		if (!search) return filteredGroups;

		return filteredGroups.filter((group) =>
			group?.name.toLowerCase().includes(search.toLowerCase())
		);
	},
});

export const get = query({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) return null;
		const group = await ctx.db.get(id);
		if (!group || group.deletedAt) return null; // Exclure les groupes supprimés
		const membership = await ctx.db
			.query("memberships")
			.withIndex("by_user_group", (q) =>
				q.eq("userId", userId as string).eq("groupId", id)
			)
			.unique();
		if (!membership) return null;
		return group;
	},
});

export const members = query({
	args: { groupId: v.id("groups") },
	handler: async (ctx, { groupId }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) return [];

		// Vérifier que le groupe existe et n'est pas supprimé
		const group = await ctx.db.get(groupId);
		if (!group || group.deletedAt) return [];

		const membership = await ctx.db
			.query("memberships")
			.withIndex("by_user_group", (q) =>
				q.eq("userId", userId as string).eq("groupId", groupId)
			)
			.unique();
		if (!membership) return [];
		const ms = await ctx.db
			.query("memberships")
			.withIndex("by_group", (q) => q.eq("groupId", groupId))
			.collect();
		return ms.map((m) => ({ userId: m.userId, joinedAt: m.createdAt }));
	},
});

export const leave = mutation({
	args: { groupId: v.id("groups") },
	handler: async (ctx, { groupId }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		const group = await ctx.db.get(groupId);
		if (!group) throw new Error("Group not found");
		if (group.ownerId == userId)
			throw new Error("Owner cannot leave own group");
		const membership = await ctx.db
			.query("memberships")
			.withIndex("by_user_group", (q) =>
				q.eq("userId", userId as string).eq("groupId", groupId)
			)
			.unique();
		if (membership) await ctx.db.delete(membership._id);
		return { left: true };
	},
});

export const rename = mutation({
	args: { id: v.id("groups"), name: v.string() },
	handler: async (ctx, { id, name }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		const group = await ctx.db.get(id);
		if (!group) throw new Error("Group not found");
		if (group.ownerId !== userId) throw new Error("Not authorized");
		await ctx.db.patch(id, { name });
		return { id };
	},
});

export const update = mutation({
	args: {
		id: v.id("groups"),
		name: v.string(),
		imageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, { id, name, imageId }) => {
		const userId = await betterAuthComponent.getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const group = await ctx.db.get(id);
		if (!group) throw new Error("Group not found");
		if (group.ownerId !== userId) throw new Error("Not authorized");

		// Prepare update data
		const updateData: { name: string; imageId?: Id<"_storage"> } = { name };
		if (imageId !== undefined) {
			updateData.imageId = imageId;
		}

		await ctx.db.patch(id, updateData);
		return { id };
	},
});

export const regenerateCode = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");
		const group = await ctx.db.get(id);
		if (!group) throw new Error("Group not found");
		if (group.ownerId !== identity.subject) throw new Error("Not authorized");
		let code = randomCode(6);
		for (let i = 0; i < 5; i++) {
			const existing = await ctx.db
				.query("groups")
				.withIndex("by_code", (q) => q.eq("code", code))
				.unique();
			if (!existing) break;
			code = randomCode(6 + i);
		}
		await ctx.db.patch(id, { code });
		return { id, code };
	},
});

const _delete = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");
		const group = await ctx.db.get(id);
		if (!group) throw new Error("Group not found");
		if (group.ownerId !== identity.subject) throw new Error("Not authorized");
		const ms = await ctx.db
			.query("memberships")
			.withIndex("by_group", (q) => q.eq("groupId", id))
			.collect();
		for (const m of ms) {
			await ctx.db.delete(m._id);
		}
		await ctx.db.delete(id);
		return { id };
	},
});

export const softDelete = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");
		const group = await ctx.db.get(id);
		if (!group) throw new Error("Group not found");
		if (group.ownerId !== identity.subject) throw new Error("Not authorized");

		// Marquer le groupe comme supprimé avec deletedAt
		await ctx.db.patch(id, { deletedAt: Date.now() });

		return { id };
	},
});

export const hardDelete = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Not authenticated");
		const group = await ctx.db.get(id);
		if (!group) throw new Error("Group not found");
		if (group.ownerId !== identity.subject) throw new Error("Not authorized");

		// Supprimer définitivement toutes les memberships
		const ms = await ctx.db
			.query("memberships")
			.withIndex("by_group", (q) => q.eq("groupId", id))
			.collect();
		for (const m of ms) {
			await ctx.db.delete(m._id);
		}

		// Supprimer définitivement le groupe
		await ctx.db.delete(id);

		return { id };
	},
});

export { _delete as delete };
