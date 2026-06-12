import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { TimelineNode } from "@/types";
import { cn } from "@/lib/utils";

interface BiographyTimelineProps {
  nodes: TimelineNode[];
  theme?: string;
}

export default function BiographyTimeline({ nodes, theme = "default" }: BiographyTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (nodes.length === 0) {
    return (
      <div className="theme-card rounded-2xl p-6 shadow-sm">
        <h3
          className={cn(
            "font-serif text-xl mb-4",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          🕰️ 生平时间轴
        </h3>
        <div
          className={cn(
            "text-center py-12",
            theme === "starry" ? "text-gray-500" : "text-memorial-400"
          )}
        >
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无生平记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          🕰️ 生平时间轴
        </h3>
        <span
          className={cn(
            "text-sm",
            theme === "starry" ? "text-gray-400" : "text-memorial-500"
          )}
        >
          共 {nodes.length} 个节点
        </span>
      </div>

      <div className="relative">
        <div
          className={cn(
            "absolute left-4 md:left-5 top-2 bottom-2 w-0.5",
            theme === "starry" ? "bg-slate-600" : "bg-memorial-200"
          )}
        />

        <div className="space-y-1">
          {nodes.map((node, index) => {
            const isExpanded = expandedId === node.id;
            const isLast = index === nodes.length - 1;
            return (
              <div key={node.id} className="relative pl-12 md:pl-14 animate-slide-up">
                <div
                  className={cn(
                    "absolute left-0 md:left-1 top-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 border-4 transition-all",
                    theme === "starry"
                      ? "bg-slate-800 border-slate-900"
                      : "bg-white border-memorial-50",
                    isExpanded &&
                      (theme === "starry"
                        ? "ring-4 ring-purple-500/30 border-purple-500"
                        : "ring-4 ring-memorial-400/30 border-memorial-400")
                  )}
                >
                  <div
                    className={cn(
                      "w-3 h-3 md:w-3.5 md:h-3.5 rounded-full",
                      theme === "starry"
                        ? isExpanded
                          ? "bg-purple-400"
                          : "bg-slate-500"
                        : isExpanded
                        ? "bg-memorial-600"
                        : "bg-memorial-400"
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "rounded-xl p-4 transition-all cursor-pointer border",
                    theme === "starry"
                      ? isExpanded
                        ? "bg-white/10 border-purple-500/40"
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-slate-600"
                      : isExpanded
                      ? "bg-memorial-50/80 border-memorial-300"
                      : "bg-memorial-50/40 border-transparent hover:bg-memorial-50 hover:border-memorial-200"
                  )}
                  onClick={() => toggleExpand(node.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-xs md:text-sm font-medium mb-1.5",
                          theme === "starry" ? "text-purple-300" : "text-memorial-600"
                        )}
                      >
                        {node.dateText}
                      </div>
                      <div
                        className={cn(
                          "font-medium text-sm md:text-base",
                          theme === "starry" ? "text-gray-100" : "text-memorial-900"
                        )}
                      >
                        {node.title}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "shrink-0 p-1 rounded-full transition-colors",
                        theme === "starry"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-memorial-400 hover:text-memorial-600"
                      )}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isExpanded
                        ? "max-h-[500px] opacity-100 mt-3"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div
                      className={cn(
                        "pt-3 border-t",
                        theme === "starry" ? "border-slate-600" : "border-memorial-200"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm md:text-base leading-relaxed whitespace-pre-wrap font-serif",
                          theme === "starry" ? "text-gray-300" : "text-memorial-700"
                        )}
                      >
                        {node.content}
                      </p>
                    </div>
                  </div>
                </div>

                {!isLast && <div className="h-2" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
