import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const likesTable = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique("likes_post_session_unique").on(table.postId, table.sessionId),
]);

export type Like = typeof likesTable.$inferSelect;
