import { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";

interface MessageWallProps {
  messages: Message[];
  onAddMessage: (author: string, content: string) => void;
  theme?: string;
}

export default function MessageWall({ messages, onAddMessage, theme = "default" }: MessageWallProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    onAddMessage(author.trim() || "匿名访客", content.trim());
    setAuthor("");
    setContent("");
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const noteColors = [
    "bg-amber-50 border-amber-200",
    "bg-pink-50 border-pink-200",
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200",
    "bg-purple-50 border-purple-200",
    "bg-orange-50 border-orange-200",
  ];

  const darkNoteColors = [
    "bg-amber-900/20 border-amber-700/40 text-gray-200",
    "bg-pink-900/20 border-pink-700/40 text-gray-200",
    "bg-blue-900/20 border-blue-700/40 text-gray-200",
    "bg-green-900/20 border-green-700/40 text-gray-200",
    "bg-purple-900/20 border-purple-700/40 text-gray-200",
    "bg-orange-900/20 border-orange-700/40 text-gray-200",
  ];

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          <MessageSquare
            className={cn(
              "w-5 h-5 inline mr-2",
              theme === "starry" ? "text-gray-400" : "text-memorial-500"
            )}
          />
          留言墙
        </h3>
        <span
          className={cn(
            "text-sm",
            theme === "starry" ? "text-gray-400" : "text-memorial-500"
          )}
        >
          {messages.length} 条留言
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              theme === "starry" ? "bg-slate-700" : "bg-memorial-100"
            )}
          >
            <User
              className={cn(
                "w-5 h-5",
                theme === "starry" ? "text-gray-400" : "text-memorial-500"
              )}
            />
          </div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="您的称呼（选填，默认为匿名访客）"
            className={cn(
              "flex-1 px-4 py-2.5 border rounded-xl focus:outline-none transition-all text-sm",
              theme === "starry"
                ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
            )}
          />
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你想说的话..."
            rows={3}
            className={cn(
              "flex-1 px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
              theme === "starry"
                ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
            )}
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white",
              theme === "starry"
                ? "bg-purple-600 hover:bg-purple-500"
                : "bg-memorial-700 hover:bg-memorial-600"
            )}
          >
            <Send className="w-4 h-4" />
            发表留言
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={cn(
                "p-4 rounded-xl border animate-fade-in",
                theme === "starry"
                  ? darkNoteColors[index % darkNoteColors.length]
                  : noteColors[index % noteColors.length]
              )}
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "font-medium text-sm",
                    theme === "starry" ? "text-gray-100" : "text-memorial-800"
                  )}
                >
                  {msg.author}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    theme === "starry" ? "text-gray-500" : "text-memorial-400"
                  )}
                >
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  theme === "starry" ? "text-gray-300" : "text-memorial-700"
                )}
              >
                {msg.content}
              </p>
            </div>
          ))
        ) : (
          <div
            className={cn(
              "text-center py-12",
              theme === "starry" ? "text-gray-500" : "text-memorial-400"
            )}
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无留言，献上第一束花吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
