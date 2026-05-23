import { Router, type IRouter } from "express";
import { eq, desc, sql, inArray, and } from "drizzle-orm";
import { db, postsTable, likesTable } from "@workspace/db";
import {
  ListPostsQueryParams,
  ListPostsResponse,
  CreatePostBody,
  GetPostParams,
  GetPostResponse,
  DeletePostParams,
  ToggleLikeParams,
  ToggleLikeResponse,
  GetTrendingPostsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getSessionId(req: import("express").Request): string {
  const cookieHeader = req.headers.cookie ?? "";
  const match = cookieHeader.match(/session_id=([^;]+)/);
  if (match) return match[1];
  return req.ip ?? "anonymous";
}

router.get("/posts/trending", async (req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(postsTable)
    .orderBy(desc(postsTable.likeCount))
    .limit(10);

  const sessionId = getSessionId(req);
  const postIds = posts.map((p) => p.id);

  let likedIds: Set<number> = new Set();
  if (postIds.length > 0) {
    const likes = await db
      .select({ postId: likesTable.postId })
      .from(likesTable)
      .where(and(inArray(likesTable.postId, postIds), eq(likesTable.sessionId, sessionId)));
    likedIds = new Set(likes.map((l) => l.postId));
  }

  const result = posts.map((p) => ({
    ...p,
    liked: likedIds.has(p.id),
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(GetTrendingPostsResponse.parse(result));
});

router.get("/posts", async (req, res): Promise<void> => {
  const parsed = ListPostsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page, pageSize, sort, filter, q } = parsed.data;
  const offset = (page - 1) * pageSize;

  const orderBy = sort === "popular" ? desc(postsTable.likeCount) : desc(postsTable.createdAt);

  const conditions = [];
  if (filter === "today") conditions.push(sql`${postsTable.createdAt} >= current_date`);
  if (q && q.trim()) conditions.push(sql`${postsTable.content} ilike ${"%" + q.trim() + "%"}`);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [posts, [{ count }]] = await Promise.all([
    db.select().from(postsTable).where(whereClause).orderBy(orderBy).limit(pageSize).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(postsTable).where(whereClause),
  ]);

  const sessionId = getSessionId(req);
  const postIds = posts.map((p) => p.id);

  let likedIds: Set<number> = new Set();
  if (postIds.length > 0) {
    const likes = await db
      .select({ postId: likesTable.postId })
      .from(likesTable)
      .where(and(inArray(likesTable.postId, postIds), eq(likesTable.sessionId, sessionId)));
    likedIds = new Set(likes.map((l) => l.postId));
  }

  const result = {
    posts: posts.map((p) => ({
      ...p,
      liked: likedIds.has(p.id),
      createdAt: p.createdAt.toISOString(),
    })),
    total: count,
    page,
    pageSize,
  };

  res.json(ListPostsResponse.parse(result));
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, nickname } = parsed.data;
  const [post] = await db
    .insert(postsTable)
    .values({ content, nickname: nickname || "匿名" })
    .returning();

  res.status(201).json(
    GetPostResponse.parse({
      ...post,
      liked: false,
      createdAt: post.createdAt.toISOString(),
    })
  );
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const sessionId = getSessionId(req);
  const [like] = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.postId, post.id), eq(likesTable.sessionId, sessionId)));

  res.json(
    GetPostResponse.parse({
      ...post,
      liked: !!like,
      createdAt: post.createdAt.toISOString(),
    })
  );
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.delete(postsTable).where(eq(postsTable.id, params.data.id)).returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/posts/:id/like", async (req, res): Promise<void> => {
  const params = ToggleLikeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const sessionId = getSessionId(req);
  const postId = params.data.id;

  const [existing] = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.postId, postId), eq(likesTable.sessionId, sessionId)));

  let liked: boolean;
  if (existing) {
    await db.delete(likesTable).where(eq(likesTable.id, existing.id));
    await db
      .update(postsTable)
      .set({ likeCount: sql`${postsTable.likeCount} - 1` })
      .where(eq(postsTable.id, postId));
    liked = false;
  } else {
    await db.insert(likesTable).values({ postId, sessionId });
    await db
      .update(postsTable)
      .set({ likeCount: sql`${postsTable.likeCount} + 1` })
      .where(eq(postsTable.id, postId));
    liked = true;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  res.json(ToggleLikeResponse.parse({ liked, likeCount: post?.likeCount ?? 0 }));
});

export default router;
