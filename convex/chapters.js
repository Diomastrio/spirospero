import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    novel_id: v.id("novels"),
    chapter_number: v.number(),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chapters", args);
  },
});

export const getByNovel = query({
  args: { novel_id: v.id("novels") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_novel", (q) => q.eq("novel_id", args.novel_id))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("chapters"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    chapter_number: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
