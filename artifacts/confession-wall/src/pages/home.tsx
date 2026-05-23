import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { StatsBar } from "@/components/stats-bar";
import { ComposePost } from "@/components/compose-post";
import { PostCard } from "@/components/post-card";
import { AnnouncementBoard } from "@/components/announcement-board";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export default function Home() {
  const { data, isLoading } = useListPosts(
    { page: 1, pageSize: 50, sort: "latest" },
    { query: { queryKey: getListPostsQueryKey({ page: 1, pageSize: 50, sort: "latest" }) } }
  );

  return (
    <Layout>
      <StatsBar />
      <AnnouncementBoard />
      <ComposePost />
      
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-serif font-bold text-lg">最新心声</h3>
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
        
        {data?.posts?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground bg-white/40 dark:bg-black/10 rounded-2xl border border-dashed border-primary/20">
            还没有人表白，快来做第一个吧！
          </div>
        )}
      </div>
    </Layout>
  );
}
