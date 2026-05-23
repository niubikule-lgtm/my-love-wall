import { useState } from "react";
import { useCreatePost } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Heart } from "lucide-react";

export function ComposePost() {
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost.mutate({
      data: {
        content,
        nickname: nickname.trim() || "匿名"
      }
    }, {
      onSuccess: () => {
        setContent("");
        setNickname("");
        toast({
          title: "发送成功",
          description: "你的心意已经传达",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/summary"] });
      },
      onError: () => {
        toast({
          title: "发送失败",
          description: "请稍后再试",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="corkboard-card bg-white/60 dark:bg-black/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-primary/20 mb-10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Heart className="w-32 h-32" />
      </div>
      <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
        你想对谁说什么？
      </h2>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的心意..."
        className="mb-4 min-h-[140px] resize-none bg-white/50 dark:bg-black/40 border-primary/10 focus-visible:ring-primary text-base font-serif"
        maxLength={500}
      />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="匿名 (选填)"
          className="sm:max-w-[200px] bg-white/50 dark:bg-black/40 border-primary/10"
          maxLength={20}
        />
        <Button 
          type="submit" 
          disabled={!content.trim() || createPost.isPending}
          className="rounded-full px-8 gap-2 shadow-sm"
        >
          <Send className="w-4 h-4" />
          {createPost.isPending ? "发送中..." : "悄悄发送"}
        </Button>
      </div>
    </form>
  );
}
