import { Link } from "wouter";
import { Heart, MessageCircle } from "lucide-react";
import { useToggleLike, getGetPostQueryKey, getListPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: number;
    content: string;
    nickname?: string | null;
    likeCount: number;
    commentCount: number;
    liked: boolean;
    createdAt: string;
  };
  isDetail?: boolean;
}

export function PostCard({ post, isDetail = false }: PostCardProps) {
  const queryClient = useQueryClient();
  const toggleLike = useToggleLike();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleLike.mutate({ id: post.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(post.id) });
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] }); 
      }
    });
  };

  const Content = (
    <div className={cn(
      "corkboard-card bg-card p-6 sm:p-8 rounded-2xl border relative animate-in fade-in zoom-in-95 duration-300", 
      isDetail ? "border-primary/30 shadow-md" : "border-border"
    )}>
      {/* Tape/pin decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3 bg-primary/20 rounded-full shadow-sm" />
      
      <div className="flex justify-between items-start mb-6">
        <span className="font-medium text-primary">
          {post.nickname || "匿名"}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: zhCN })}
        </span>
      </div>
      <p className="text-foreground whitespace-pre-wrap leading-relaxed font-serif text-lg sm:text-xl mb-8">
        {post.content}
      </p>
      <div className="flex items-center gap-6">
        <button 
          onClick={handleLike}
          disabled={toggleLike.isPending}
          className={cn(
            "flex items-center gap-2 transition-colors text-sm",
            post.liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          )}
        >
          <Heart className={cn("h-5 w-5 transition-transform", post.liked && "fill-current heart-animation text-destructive")} />
          <span className="font-medium">{post.likeCount}</span>
        </button>
        
        {isDetail ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{post.commentCount}</span>
          </div>
        ) : (
          <Link href={`/post/${post.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{post.commentCount}</span>
          </Link>
        )}
      </div>
    </div>
  );

  if (isDetail) return Content;

  return (
    <Link href={`/post/${post.id}`} className="block group">
      {Content}
    </Link>
  );
}
