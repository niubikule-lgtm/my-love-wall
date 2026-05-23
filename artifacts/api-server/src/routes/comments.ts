import { Router, type IRouter } from "express";
import { eq, asc, sql } from "drizzle-orm";
import { db, commentsTable, postsTable } from "@workspace/db";
import {
  ListCommentsParams,
  ListCommentsResponse,
  CreateCommentParams,
  CreateCommentBody,
  DeleteCommentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts/:id/comments", async (req, res): Promise<void> => {
  const params = ListCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.postId, params.data.id))
    .orderBy(asc(commentsTable.createdAt));

  res.json(
    ListCommentsResponse.parse(
      comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))
    )
  );
});

router.post("/posts/:id/comments", async (req, res): Promise<void> => {
  const params = CreateCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, nickname } = parsed.data;
  const postId = params.data.id;

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({ postId, content, nickname: nickname || "匿名" })
    .returning();

  await db
    .update(postsTable)
    .set({ commentCount: sql`${postsTable.commentCount} + 1` })
    .where(eq(postsTable.id, postId));

  res.status(201).json({ ...comment, createdAt: comment.createdAt.toISOString() });
});

router.delete("/comments/:commentId", async (req, res): Promise<void> => {
  const params = DeleteCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, params.data.commentId));

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, params.data.commentId));

  await db
    .update(postsTable)
    .set({ commentCount: sql`${postsTable.commentCount} - 1` })
    .where(eq(postsTable.id, comment.postId));

  res.sendStatus(204);
});

export default router;
