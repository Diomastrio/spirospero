import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: { novel_id: v.id("novels"), rating: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_novel_user", (q) => q.eq("novel_id", args.novel_id).eq("user_id", userId))
      .first();
      
    if (existing) {
      await ctx.db.patch(existing._id, { rating: args.rating });
    } else {
      await ctx.db.insert("ratings", {
        novel_id: args.novel_id,
        user_id: userId,
        rating: args.rating,
      });
    }
  },
});

export const getByUser = query({
  args: { novel_id: v.id("novels") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const rating = await ctx.db
      .query("ratings")
      .withIndex("by_novel_user", (q) => q.eq("novel_id", args.novel_id).eq("user_id", userId))
      .first();
      
    return rating;
  },
});
