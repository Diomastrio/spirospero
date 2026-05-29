import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  novels: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    cover_image_id: v.optional(v.id("_storage")),
    cover_image_url: v.optional(v.string()),
    genre: v.optional(v.string()),
    status: v.optional(v.string()),
    published: v.optional(v.boolean()),
    author_id: v.id("users"), // from auth
  }),
  chapters: defineTable({
    novel_id: v.id("novels"),
    chapter_number: v.number(),
    title: v.string(),
    content: v.string(),
  }).index("by_novel", ["novel_id"]),
  bookmarks: defineTable({
    user_id: v.id("users"),
    novel_id: v.id("novels"),
  })
    .index("by_user", ["user_id"])
    .index("by_novel_user", ["novel_id", "user_id"]),
  ratings: defineTable({
    user_id: v.id("users"),
    novel_id: v.id("novels"),
    rating: v.number(),
  }).index("by_novel_user", ["novel_id", "user_id"]),
});
