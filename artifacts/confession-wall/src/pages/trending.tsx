import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";

export default function Trending() {
  const { data, isLoading } = useListPosts(
    { page: 1, pageSize: 50, sort: "popular" },
    { query: { queryKey: getListPostsQueryKey({ page: 1, pageSize: 50, sort: "popular" }) } }
  );

  return (
    <Layout>
      <div className="mb-8 flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-xl border border-primary/10">
        <div className="bg-white dark:bg-black/20 p-2 rounded-full shadow-sm">
          <Flame className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">热门表白</h1>
          <p className="text-sm text-muted-foreground">那些引起大家共鸣的心声</p>
        </div>
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
            还没有热门表白
          </div>
        )}
      </div>
    </Layout>
  );
}
