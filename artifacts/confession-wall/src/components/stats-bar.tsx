import { useGetStatsSummary, getGetStatsSummaryQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareHeart, Heart, Users } from "lucide-react";

export function StatsBar() {
  const { data: stats, isLoading } = useGetStatsSummary({
    query: { queryKey: getGetStatsSummaryQueryKey() }
  });

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-2xl mb-8" />;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
      <div className="flex flex-col items-center justify-center p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-primary/10 shadow-sm">
        <Users className="h-5 w-5 text-primary mb-2 opacity-80" />
        <span className="text-2xl font-bold text-foreground font-serif">{stats.totalPosts}</span>
        <span className="text-xs text-muted-foreground mt-1">总表白</span>
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-primary/10 shadow-sm">
        <Heart className="h-5 w-5 text-primary mb-2 opacity-80" />
        <span className="text-2xl font-bold text-foreground font-serif">{stats.totalLikes}</span>
        <span className="text-xs text-muted-foreground mt-1">传递心动</span>
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-primary/10 shadow-sm">
        <MessageSquareHeart className="h-5 w-5 text-primary mb-2 opacity-80" />
        <span className="text-2xl font-bold text-foreground font-serif">{stats.totalComments}</span>
        <span className="text-xs text-muted-foreground mt-1">收到回应</span>
      </div>
    </div>
  );
}
