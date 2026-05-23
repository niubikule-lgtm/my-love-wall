# 校园表白墙

一个供同学们匿名发帖、点赞、评论的校园表白墙应用。

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/confession-wall run dev` — run the frontend (port 19073)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + Framer Motion + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB schema (posts.ts, comments.ts, likes.ts)
- `artifacts/api-server/src/routes/` — API route handlers (posts.ts, comments.ts, stats.ts)
- `artifacts/confession-wall/src/` — Frontend React app
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- Session-based likes (IP + cookie session_id) — no login required, anonymous by design
- Like state is tracked per session to show if a user has liked a post
- Posts store denormalized likeCount/commentCount for fast rendering without joins
- OpenAPI-first: spec gates codegen which gates frontend hooks
- Frontend served at `/`, API at `/api`

## Product

- 主页：浏览最新表白帖子，发表新帖子，查看统计数据（总表白数、心动数、回应数）
- 热门页：按点赞数排序的热门表白
- 帖子详情页：查看单条表白和所有评论，发表评论
- 匿名发帖，昵称可选（默认"匿名"）
- 点赞功能（同一会话可取消点赞）

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing the DB schema
- The `likes` table uses a unique constraint on (post_id, session_id) to prevent duplicate likes
- Use Drizzle `inArray` + `and` for multi-row like checks — raw `sql` template with ANY syntax fails

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
