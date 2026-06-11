import { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import type { Message } from "@/types";

interface MessageWallProps {
  messages: Message[];
  onAddMessage: (author: string, content: string) => void;
}

export default function MessageWall({ messages, onAddMessage }: MessageWallProps) {
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-memorial-950">
          <MessageSquare className="w-5 h-5 inline mr-2 text-memorial-500" />
          留言墙
        </h3>
        <span className="text-memorial-500 text-sm">{messages.length} 条留言</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-memorial-500" />
          </div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="您的称呼（选填，默认为匿名访客）"
            className="flex-1 px-4 py-2.5 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你想说的话..."
            rows={3}
            className="flex-1 px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all resize-none text-sm"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-2 bg-memorial-700 text-white px-6 py-2.5 rounded-xl hover:bg-memorial-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              className={`p-4 rounded-xl border ${noteColors[index % noteColors.length]} animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-memorial-800 text-sm">
                  {msg.author}
                </span>
                <span className="text-xs text-memorial-400">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <p className="text-memorial-700 text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-memorial-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无留言，献上第一束花吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
