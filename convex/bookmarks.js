import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: { novel_id: v.id("novels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_novel_user", (q) => q.eq("novel_id", args.novel_id).eq("user_id", userId))
      .first();
      
    if (existing) return existing._id;
    return await ctx.db.insert("bookmarks", {
      novel_id: args.novel_id,
      user_id: userId,
    });
  },
});

export const remove = mutation({
  args: { novel_id: v.id("novels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_novel_user", (q) => q.eq("novel_id", args.novel_id).eq("user_id", userId))
      .first();
      
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();
      
    // Join novels
    return Promise.all(
      bookmarks.map(async (b) => {
        const novel = await ctx.db.get(b.novel_id);
        return { ...b, novels: novel }; // supabase joined as bookmarks[...].novels
      })
    );
  },
});

export const isBookmarked = query({
  args: { novel_id: v.id("novels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_novel_user", (q) => q.eq("novel_id", args.novel_id).eq("user_id", userId))
      .first();
      
    return !!existing;
  },
});
