import { useState } from "react";
import { Link } from "react-router-dom";
import { Waves, Send, X, Eye } from "lucide-react";
import type { DriftBottle } from "@/types";
import { cn } from "@/lib/utils";

interface DriftBottleAreaProps {
  memorialId: string;
  driftBottles: DriftBottle[];
  onSendBottle: (content: string) => DriftBottle | null;
  onMarkRead: (bottleId: string) => void;
  theme?: string;
}

export default function DriftBottleArea({
  driftBottles,
  onSendBottle,
  onMarkRead,
  theme = "default",
}: DriftBottleAreaProps) {
  const [showSendForm, setShowSendForm] = useState(false);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentAnimation, setSentAnimation] = useState(false);
  const [sentTarget, setSentTarget] = useState<string>("");
  const [expandedBottle, setExpandedBottle] = useState<string | null>(null);

  const unreadBottles = driftBottles.filter((b) => !b.isRead);
  const readBottles = driftBottles.filter((b) => b.isRead);

  const handleSend = () => {
    if (!content.trim()) return;
    setIsSending(true);

    const result = onSendBottle(content.trim());
    if (result) {
      setContent("");
      setShowSendForm(false);
      setSentTarget(result.toMemorialId);
      setSentAnimation(true);
      setTimeout(() => {
        setSentAnimation(false);
        setSentTarget("");
      }, 3000);
    }
    setIsSending(false);
  };

  const handleOpenBottle = (bottle: DriftBottle) => {
    setExpandedBottle(bottle.id);
    if (!bottle.isRead) {
      onMarkRead(bottle.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const bottleColors = [
    "bg-blue-50 border-blue-200",
    "bg-cyan-50 border-cyan-200",
    "bg-teal-50 border-teal-200",
    "bg-indigo-50 border-indigo-200",
    "bg-sky-50 border-sky-200",
  ];

  const darkBottleColors = [
    "bg-blue-900/20 border-blue-700/40 text-gray-200",
    "bg-cyan-900/20 border-cyan-700/40 text-gray-200",
    "bg-teal-900/20 border-teal-700/40 text-gray-200",
    "bg-indigo-900/20 border-indigo-700/40 text-gray-200",
    "bg-sky-900/20 border-sky-700/40 text-gray-200",
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
          <Waves
            className={cn(
              "w-5 h-5 inline mr-2",
              theme === "starry" ? "text-gray-400" : "text-memorial-500"
            )}
          />
          漂流寄语
        </h3>
        {unreadBottles.length > 0 && (
          <span
            className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium",
              theme === "starry"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-blue-100 text-blue-700"
            )}
          >
            {unreadBottles.length} 封未读
          </span>
        )}
      </div>

      {sentAnimation && (
        <div
          className={cn(
            "mb-6 p-4 rounded-xl text-center animate-fade-in",
            theme === "starry"
              ? "bg-cyan-900/30 border border-cyan-700/40"
              : "bg-cyan-50 border border-cyan-200"
          )}
        >
          <div className="text-3xl mb-2 drift-float">🍾</div>
          <p
            className={cn(
              "text-sm font-medium",
              theme === "starry" ? "text-cyan-200" : "text-cyan-700"
            )}
          >
            寄语瓶已随波漂走...
          </p>
          <Link
            to={`/memorial/${sentTarget}`}
            className={cn(
              "text-xs mt-1 inline-block underline",
              theme === "starry"
                ? "text-cyan-400 hover:text-cyan-200"
                : "text-cyan-600 hover:text-cyan-800"
            )}
          >
            去看看它漂到了哪里
          </Link>
        </div>
      )}

      {driftBottles.length > 0 && (
        <div className="mb-6 space-y-3 max-h-72 overflow-y-auto">
          {unreadBottles.map((bottle, index) => (
            <div key={bottle.id}>
              <button
                onClick={() => handleOpenBottle(bottle)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all animate-fade-in",
                  theme === "starry"
                    ? "bg-blue-900/30 border-blue-600/50 hover:border-blue-500/60"
                    : "bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-sm"
                )}
                style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg drift-float">🍾</span>
                  <span
                    className={cn(
                      "font-medium text-sm",
                      theme === "starry" ? "text-blue-200" : "text-blue-700"
                    )}
                  >
                    来自远方的寄语
                  </span>
                  <span
                    className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full",
                      theme === "starry"
                        ? "bg-blue-500/30 text-blue-200"
                        : "bg-blue-200 text-blue-700"
                    )}
                  >
                    未读
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm line-clamp-2",
                    theme === "starry" ? "text-gray-300" : "text-memorial-700"
                  )}
                >
                  {bottle.content}
                </p>
                <div
                  className={cn(
                    "text-xs mt-2",
                    theme === "starry" ? "text-gray-500" : "text-memorial-400"
                  )}
                >
                  来自「{bottle.fromMemorialName}」的纪念页 · {formatDate(bottle.createdAt)}
                </div>
              </button>

              {expandedBottle === bottle.id && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
                  <div
                    className={cn(
                      "rounded-2xl p-6 max-w-sm w-full animate-fade-in",
                      theme === "starry" ? "bg-slate-800" : "bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4
                        className={cn(
                          "font-serif text-lg flex items-center gap-2",
                          theme === "starry" ? "text-gray-100" : "text-memorial-950"
                        )}
                      >
                        <span className="text-2xl">🍾</span>
                        漂流寄语
                      </h4>
                      <button
                        onClick={() => setExpandedBottle(null)}
                        className={cn(
                          "p-1 rounded-full transition-colors",
                          theme === "starry"
                            ? "hover:bg-white/10 text-gray-400"
                            : "hover:bg-memorial-100 text-memorial-500"
                        )}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap mb-4",
                        theme === "starry" ? "text-gray-300" : "text-memorial-700"
                      )}
                    >
                      {bottle.content}
                    </p>
                    <div
                      className={cn(
                        "text-xs flex items-center justify-between pt-3 border-t",
                        theme === "starry"
                          ? "text-gray-500 border-slate-600"
                          : "text-memorial-400 border-memorial-100"
                      )}
                    >
                      <span>
                        来自「{bottle.fromMemorialName}」的纪念页
                      </span>
                      <span>{formatDate(bottle.createdAt)}</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Link
                        to={`/memorial/${bottle.fromMemorialId}`}
                        onClick={() => setExpandedBottle(null)}
                        className={cn(
                          "flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium",
                          theme === "starry"
                            ? "bg-blue-600/30 text-blue-200 hover:bg-blue-600/40 border border-blue-500/30"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        )}
                      >
                        <Eye className="w-4 h-4" />
                        回访
                      </Link>
                      <button
                        onClick={() => setExpandedBottle(null)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl transition-colors text-sm",
                          theme === "starry"
                            ? "bg-white/10 text-gray-300 hover:bg-white/15"
                            : "bg-memorial-50 text-memorial-700 hover:bg-memorial-100"
                        )}
                      >
                        收下寄语
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {readBottles.map((bottle, index) => (
            <div
              key={bottle.id}
              className={cn(
                "p-3 rounded-xl border animate-fade-in",
                theme === "starry"
                  ? darkBottleColors[index % darkBottleColors.length]
                  : bottleColors[index % bottleColors.length]
              )}
              style={{
                animationDelay: `${(unreadBottles.length + index) * 0.05}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">🌊</span>
                <span
                  className={cn(
                    "text-xs",
                    theme === "starry" ? "text-gray-400" : "text-memorial-500"
                  )}
                >
                  来自「{bottle.fromMemorialName}」
                </span>
                <span
                  className={cn(
                    "text-xs ml-auto",
                    theme === "starry" ? "text-gray-500" : "text-memorial-400"
                  )}
                >
                  {formatDate(bottle.createdAt)}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  theme === "starry" ? "text-gray-300" : "text-memorial-700"
                )}
              >
                {bottle.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {driftBottles.length === 0 && !sentAnimation && (
        <div
          className={cn(
            "text-center py-8 mb-4 rounded-xl",
            theme === "starry"
              ? "bg-slate-700/30"
              : "bg-gradient-to-b from-blue-50/50 to-cyan-50/50"
          )}
        >
          <div className="text-3xl mb-2 opacity-60 drift-float">🍾</div>
          <p
            className={cn(
              "text-sm",
              theme === "starry" ? "text-gray-500" : "text-memorial-400"
            )}
          >
            还没有漂流瓶漂来这里
          </p>
          <p
            className={cn(
              "text-xs mt-1",
              theme === "starry" ? "text-gray-600" : "text-memorial-300"
            )}
          >
            写一封寄语，让它随波漂流到另一个纪念页吧
          </p>
        </div>
      )}

      {showSendForm ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你想寄托的匿名寄语，它会随波漂到另一个纪念页..."
            rows={3}
            maxLength={200}
            className={cn(
              "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
              theme === "starry"
                ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                : "border-memorial-200 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
            )}
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs",
                theme === "starry" ? "text-gray-500" : "text-memorial-400"
              )}
            >
              {content.length}/200 · 匿名寄语
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSendForm(false);
                  setContent("");
                }}
                className={cn(
                  "px-4 py-2 text-sm transition-colors",
                  theme === "starry"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-memorial-500 hover:text-memorial-700"
                )}
              >
                取消
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !content.trim()}
                className={cn(
                  "inline-flex items-center gap-2 text-white py-2.5 px-5 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                  theme === "starry"
                    ? "bg-cyan-600 hover:bg-cyan-500"
                    : "bg-blue-600 hover:bg-blue-500"
                )}
              >
                <Send className="w-4 h-4" />
                投放漂流瓶
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSendForm(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl transition-colors font-medium",
            theme === "starry"
              ? "bg-cyan-700 hover:bg-cyan-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          )}
        >
          <Waves className="w-5 h-5" />
          写一封漂流寄语
        </button>
      )}

      <style>{`
        @keyframes driftFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(2deg); }
          75% { transform: translateY(2px) rotate(-1deg); }
        }
        .drift-float {
          animation: driftFloat 3s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
