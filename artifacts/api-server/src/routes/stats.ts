import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, postsTable, commentsTable, likesTable } from "@workspace/db";
import { GetStatsSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [[{ totalPosts }], [{ totalLikes }], [{ totalComments }], [{ todayPosts }]] =
    await Promise.all([
      db.select({ totalPosts: sql<number>`count(*)::int` }).from(postsTable),
      db.select({ totalLikes: sql<number>`coalesce(sum(like_count), 0)::int` }).from(postsTable),
      db.select({ totalComments: sql<number>`count(*)::int` }).from(commentsTable),
      db.select({
        todayPosts: sql<number>`count(*)::int`,
      }).from(postsTable).where(sql`created_at >= current_date`),
    ]);

  res.json(GetStatsSummaryResponse.parse({ totalPosts, totalLikes, totalComments, todayPosts }));
});

export default router;
