import { useState } from "react";
import { useListComments, useCreateComment, getListCommentsQueryKey, getGetPostQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircleHeart, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CommentList({ postId }: { postId: number }) {
  const { data: comments, isLoading } = useListComments(postId, {
    query: { enabled: !!postId, queryKey: getListCommentsQueryKey(postId) }
  });
  
  const createComment = useCreateComment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createComment.mutate({
      id: postId,
      data: {
        content,
        nickname: nickname.trim() || "匿名"
      }
    }, {
      onSuccess: () => {
        setContent("");
        setNickname("");
        toast({ title: "评论成功" });
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      },
      onError: () => {
        toast({ title: "评论失败", variant: "destructive" });
      }
    });
  };

  return (
    <div className="mt-12 bg-white/40 dark:bg-black/10 rounded-2xl p-6 sm:p-8 border border-primary/5">
      <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2 mb-8">
        <MessageCircleHeart className="h-6 w-6 text-primary" />
        评论 ({comments?.length || 0})
      </h3>

      <form onSubmit={handleSubmit} className="mb-10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="匿名 (选填)"
            className="sm:w-32 bg-white/60 dark:bg-black/40 border-primary/10"
            maxLength={20}
          />
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的回应..."
            className="flex-1 bg-white/60 dark:bg-black/40 border-primary/10"
            maxLength={200}
          />
          <Button 
            type="submit" 
            disabled={!content.trim() || createComment.isPending}
            className="rounded-full shrink-0 px-6 gap-2"
          >
            <Send className="w-4 h-4" />
            {createComment.isPending ? "发送中..." : "发表评论"}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        ) : comments?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm bg-background/50 rounded-xl border border-dashed border-primary/20">
            还没有人评论，来说第一句吧
          </div>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="p-5 bg-card/60 rounded-xl border border-primary/10 animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="font-medium text-sm text-primary">{comment.nickname || "匿名"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
                </span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
