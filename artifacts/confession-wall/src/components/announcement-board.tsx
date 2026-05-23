import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, ChevronDown, Pin } from "lucide-react";

const announcements = [
  {
    id: 1,
    tag: "温馨提示",
    content: "表白墙完全匿名，请文明表达，传递温暖。禁止发布任何人身攻击或不雅内容。",
    color: "bg-rose-50 border-rose-200",
    tagColor: "bg-rose-100 text-rose-500",
    pinColor: "text-rose-400",
  },
  {
    id: 3,
    tag: "使用说明",
    content: "点击帖子卡片可查看详情和评论，右下角心形图标可以点赞，每条表白最多 500 字。",
    color: "bg-fuchsia-50 border-fuchsia-200",
    tagColor: "bg-fuchsia-100 text-fuchsia-500",
    pinColor: "text-fuchsia-400",
  },
  {
    id: 4,
    tag: "再次提示",
    content: "再次提醒，请各位同学使用时遵守本站规则，禁止发布任何人身攻击或不雅内容。本站站长 @下北泽第一贝斯手凉乞钞 对内容进行全面监管并短暂记录访问者 IP。",
    color: "bg-amber-50 border-amber-200",
    tagColor: "bg-amber-100 text-amber-600",
    pinColor: "text-amber-400",
  },
];

export function AnnouncementBoard() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full group mb-3"
      >
        <Megaphone className="w-4 h-4 text-primary shrink-0" />
        <h3 className="font-serif font-bold text-base text-foreground">公告栏</h3>
        <span className="flex-1 h-px bg-primary/15 mx-1" />
        <motion.span
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground group-hover:text-primary transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="board"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {announcements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative rounded-xl border p-4 pt-5 ${a.color} shadow-sm`}
                >
                  <Pin
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 ${a.pinColor} rotate-12`}
                    strokeWidth={2.5}
                  />
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${a.tagColor}`}
                  >
                    {a.tag}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/80">{a.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
