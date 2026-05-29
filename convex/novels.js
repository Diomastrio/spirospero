import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    cover_image_id: v.optional(v.id("_storage")),
    cover_image_url: v.optional(v.string()),
    genre: v.optional(v.string()),
    status: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    return await ctx.db.insert("novels", {
      ...args,
      author_id: userId,
    });
  },
});

export const getById = query({
  args: { id: v.id("novels") },
  handler: async (ctx, args) => {
    const novel = await ctx.db.get(args.id);
    if (!novel) return null;
    const author = await ctx.db.get(novel.author_id);
    return { ...novel, profiles: { nickname: author?.name || "Unknown" } };
  },
});

export const getByAuthor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("novels")
      .filter((q) => q.eq(q.field("author_id"), userId))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const novels = await ctx.db.query("novels").filter(q => q.eq(q.field("published"), true)).collect();
    return Promise.all(
      novels.map(async (n) => {
        const author = await ctx.db.get(n.author_id);
        return { ...n, profiles: { nickname: author?.name || "Unknown" } };
      })
    );
  },
});

export const update = mutation({
  args: {
    id: v.id("novels"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    cover_image_id: v.optional(v.id("_storage")),
    cover_image_url: v.optional(v.string()),
    genre: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return await ctx.db.get(id);
  },
});

export const publish = mutation({
  args: { id: v.id("novels"), published: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { published: args.published });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("novels") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
