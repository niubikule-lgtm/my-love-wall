import { useState, useCallback } from "react";
import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { StatsBar } from "@/components/stats-bar";
import { ComposePost } from "@/components/compose-post";
import { PostCard } from "@/components/post-card";
import { AnnouncementBoard } from "@/components/announcement-board";
import { WelcomeBanner } from "@/components/welcome-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Sun, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
type Filter = "all" | "today";

export default function Home() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  const params = { page, pageSize: PAGE_SIZE, sort: "latest" as const, filter, q: q || undefined };

  const { data, isLoading } = useListPosts(
    params,
    { query: { queryKey: getListPostsQueryKey(params) } }
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const handleSearch = useCallback(() => {
    setQ(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleClearSearch = () => {
    setSearchInput("");
    setQ("");
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const isSearching = q.length > 0;

  return (
    <Layout>
      <WelcomeBanner />
      <StatsBar />
      <AnnouncementBoard />
      <ComposePost />

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索表白内容..."
          className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-primary/20 bg-white/70 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            搜索
          </button>
        </div>
      </div>

      {/* Section header with filters */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <h3 className="font-serif font-bold text-lg">
          {isSearching ? `"${q}" 的结果` : "最新心声"}
        </h3>

        {!isSearching && (
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => handleFilterChange("all")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                filter === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-primary/20 bg-white/60 text-muted-foreground hover:bg-primary/10"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleFilterChange("today")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                filter === "today"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-primary/20 bg-white/60 text-muted-foreground hover:bg-primary/10"
              }`}
            >
              <Sun className="w-3 h-3" />
              今日
            </button>
          </div>
        )}

        {data && data.total > 0 && (
          <span className={`text-xs text-muted-foreground whitespace-nowrap ${!isSearching ? "" : "ml-auto"}`}>
            {data.total} 条 · {page}/{totalPages} 页
          </span>
        )}
      </div>

      {/* Posts */}
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
            {isSearching
              ? `没有找到包含"${q}"的表白`
              : filter === "today"
              ? "今天还没有人表白，快来做第一个吧！"
              : "还没有人表白，快来做第一个吧！"}
          </div>
        )}
      </div>

      {/* Pagination */}
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
