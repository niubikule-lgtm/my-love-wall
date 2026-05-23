import { useState } from "react";
import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { StatsBar } from "@/components/stats-bar";
import { ComposePost } from "@/components/compose-post";
import { PostCard } from "@/components/post-card";
import { AnnouncementBoard } from "@/components/announcement-board";
import { WelcomeBanner } from "@/components/welcome-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function Home() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListPosts(
    { page, pageSize: PAGE_SIZE, sort: "latest" },
    { query: { queryKey: getListPostsQueryKey({ page, pageSize: PAGE_SIZE, sort: "latest" }) } }
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <WelcomeBanner />
      <StatsBar />
      <AnnouncementBoard />
      <ComposePost />

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-serif font-bold text-lg">最新心声</h3>
        {data && data.total > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            共 {data.total} 条 · 第 {page}/{totalPages} 页
          </span>
        )}
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </>
        ) : (
          data?.posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}

        {!isLoading && data?.posts?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground bg-white/40 dark:bg-black/10 rounded-2xl border border-dashed border-primary/20">
            还没有人表白，快来做第一个吧！
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border border-primary/20 bg-white/60 text-foreground hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-primary/20 bg-white/60 text-foreground hover:bg-primary/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border border-primary/20 bg-white/60 text-foreground hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </Layout>
  );
}
