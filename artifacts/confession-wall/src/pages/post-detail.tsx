import { useParams, Link } from "wouter";
import { useGetPost, getGetPostQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { PostCard } from "@/components/post-card";
import { CommentList } from "@/components/comment-list";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function PostDetail() {
  const { id } = useParams();
  const postId = Number(id);
  
  const { data: post, isLoading } = useGetPost(postId, {
    query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) }
  });

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
      ) : post ? (
        <div>
          <PostCard post={post} isDetail />
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground bg-white/40 dark:bg-black/10 rounded-2xl border border-dashed border-primary/20">
          找不到该表白
        </div>
      )}

      {post && <CommentList postId={postId} />}
    </Layout>
  );
}
