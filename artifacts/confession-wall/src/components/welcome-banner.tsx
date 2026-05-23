import { Info } from "lucide-react";

export function WelcomeBanner() {
  return (
    <div className="mb-5 rounded-2xl border border-pink-200 bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="space-y-1 text-sm leading-relaxed text-foreground/80">
          <p>
            欢迎各位同学在此表白心声，本站完全匿名，无需担心安全问题。本站记录的访问者 IP 将会在 24 小时后自动删除。
          </p>
          <p className="text-xs text-muted-foreground pt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>本站站长：@下北泽第一贝斯手凉乞钞</span>
            <span>使用 Replit VibeCoding 全栈开发</span>
          </p>
        </div>
      </div>
    </div>
  );
}
