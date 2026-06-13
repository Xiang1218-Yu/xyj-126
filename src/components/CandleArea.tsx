import { useState, useMemo } from "react";
import { Flame, Send, Star, Sparkles, X } from "lucide-react";
import type { Candle } from "@/types";
import Danmaku from "./Danmaku";
import { cn } from "@/lib/utils";

interface CandleAreaProps {
  candles: Candle[];
  onAddCandle: (data: { name: string; message: string; isEternal: boolean }) => void;
  theme?: string;
}

const PRESET_NAMES = ["追思灯", "感恩灯", "思念灯", "祈福灯", "平安灯", "长明灯"];

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${month}月${day}日 ${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export default function CandleArea({ candles, onAddCandle, theme = "default" }: CandleAreaProps) {
  const [message, setMessage] = useState("");
  const [candleName, setCandleName] = useState("");
  const [isEternal, setIsEternal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCandle, setSelectedCandle] = useState<Candle | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const handleLightCandle = () => {
    setIsAnimating(true);
    onAddCandle({ name: candleName.trim(), message: message.trim(), isEternal });
    setMessage("");
    setCandleName("");
    setIsEternal(false);
    setShowInput(false);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const sortedCandles = useMemo(() => {
    const sorted = [...candles].sort((a, b) => {
      if (a.isEternal !== b.isEternal) return a.isEternal ? -1 : 1;
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
    return sorted;
  }, [candles, sortOrder]);

  const displayCandles = sortedCandles.slice(0, 20);
  const eternalCount = candles.filter((c) => c.isEternal).length;

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          🕯️ 点烛台
        </h3>
        <div className="flex items-center gap-3">
          {eternalCount > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                theme === "starry"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-gold-100 text-gold-700"
              )}
            >
              <Sparkles className="w-3 h-3" />
              长明 {eternalCount}
            </span>
          )}
          <span
            className={cn(
              "text-sm",
              theme === "starry" ? "text-gray-400" : "text-memorial-500"
            )}
          >
            共 {candles.length} 盏烛
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setSortOrder("newest")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg transition-colors",
            sortOrder === "newest"
              ? theme === "starry"
                ? "bg-slate-600 text-gray-100"
                : "bg-memorial-100 text-memorial-800"
              : theme === "starry"
              ? "text-gray-400 hover:text-gray-200"
              : "text-memorial-500 hover:text-memorial-700"
          )}
        >
          最新点燃
        </button>
        <button
          onClick={() => setSortOrder("oldest")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg transition-colors",
            sortOrder === "oldest"
              ? theme === "starry"
                ? "bg-slate-600 text-gray-100"
                : "bg-memorial-100 text-memorial-800"
              : theme === "starry"
              ? "text-gray-400 hover:text-gray-200"
              : "text-memorial-500 hover:text-memorial-700"
          )}
        >
          最早点燃
        </button>
      </div>

      <div
        className={cn(
          "relative min-h-[200px] rounded-xl p-6 mb-6 overflow-hidden",
          theme === "starry"
            ? "bg-gradient-to-b from-slate-700/30 to-transparent"
            : "bg-gradient-to-b from-memorial-950/5 to-transparent"
        )}
      >
        <Danmaku items={candles} variant="candle" />

        <div className="flex flex-wrap justify-center gap-6">
          {displayCandles.map((candle, index) => (
            <div
              key={candle.id}
              className="flex flex-col items-center animate-fade-in cursor-pointer group"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
              onClick={() => setSelectedCandle(candle)}
            >
              {candle.isEternal ? (
                <div className="relative w-10 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-gold-400/60 via-amber-400/30 to-transparent blur-md animate-pulse" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gold-400/20 blur-xl animate-pulse" style={{ animationDuration: "2s" }} />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute -left-3 -top-2 text-[8px] text-amber-300 animate-ping" style={{ animationDuration: "1.5s" }}>✦</div>
                      <div className="absolute left-2 -top-1 text-[10px] text-gold-400 animate-pulse" style={{ animationDelay: "0.5s" }}>✧</div>
                      <div className="absolute -left-1 -top-4 text-[8px] text-amber-200 animate-pulse" style={{ animationDelay: "1s" }}>✦</div>
                    </div>
                    <div className="animate-bounce" style={{ animationDuration: "2s" }}>
                      <Sparkles
                        className={cn(
                          "w-5 h-5",
                          theme === "starry" ? "text-amber-300" : "text-gold-500"
                        )}
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-14 bg-gradient-to-t from-red-700 via-red-600 to-gold-500 rounded-t-sm shadow-lg shadow-gold-500/40 group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-[56px] left-1/2 -translate-x-1/2 w-10 h-3 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-sm shadow-md" />
                  <div className="absolute bottom-[62px] left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gold-300 rounded-sm" />
                  <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-t from-orange-600 via-gold-400 to-yellow-200 rounded-full animate-flicker origin-bottom shadow-2xl shadow-gold-400/60"
                    style={{ filter: "blur(0.3px)" }}
                  />
                  <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-7 bg-gradient-to-t from-orange-400 via-yellow-300 to-white rounded-full animate-flicker origin-bottom"
                    style={{ animationDelay: "0.1s", filter: "blur(0.5px)" }}
                  />
                  <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-4 bg-gradient-to-t from-yellow-200 to-white rounded-full animate-flicker origin-bottom"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 rounded-full shadow-md" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-2.5 bg-gradient-to-r from-gold-800 via-gold-600 to-gold-800 rounded-full shadow-lg" />
                </div>
              ) : (
                <div className="relative w-5 h-14">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-9 bg-gradient-to-t from-candle-400 to-candle-200 rounded-sm group-hover:scale-105 transition-transform" />
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-5 bg-gradient-to-t from-candle-500 via-candle-400 to-yellow-200 rounded-full animate-flicker origin-bottom"
                    style={{ filter: "blur(0.5px)" }}
                  />
                  <div
                    className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-gradient-to-t from-orange-400 to-yellow-200 rounded-full animate-flicker origin-bottom"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-candle-500/40 rounded-full" />
                </div>
              )}
              {candle.name && (
                <p
                  className={cn(
                    "mt-2 text-xs font-medium max-w-[80px] truncate",
                    candle.isEternal
                      ? theme === "starry"
                        ? "text-gold-300"
                        : "text-gold-700"
                      : theme === "starry"
                      ? "text-gray-300"
                      : "text-memorial-700"
                  )}
                  title={candle.name}
                >
                  {candle.name}
                </p>
              )}
              <p
                className={cn(
                  "text-[10px] mt-0.5",
                  theme === "starry" ? "text-gray-500" : "text-memorial-400"
                )}
              >
                {formatDateTime(candle.createdAt)}
              </p>
            </div>
          ))}

          {candles.length === 0 && (
            <div
              className={cn(
                "text-center py-8",
                theme === "starry" ? "text-gray-500" : "text-memorial-400"
              )}
            >
              <Flame className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">为逝者点燃一盏心灯</p>
            </div>
          )}
        </div>

        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-candle-400/30 animate-ping" />
          </div>
        )}
      </div>

      {showInput ? (
        <div className="space-y-3">
          <div>
            <label
              className={cn(
                "block text-xs mb-1.5 font-medium",
                theme === "starry" ? "text-gray-400" : "text-memorial-600"
              )}
            >
              蜡烛命名（可选）
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_NAMES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCandleName(n)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors",
                    candleName === n
                      ? theme === "starry"
                        ? "bg-amber-500/30 border-amber-400/50 text-amber-200"
                        : "bg-gold-100 border-gold-300 text-gold-700"
                      : theme === "starry"
                      ? "border-slate-600 text-gray-400 hover:text-gray-200 hover:border-slate-500"
                      : "border-memorial-200 text-memorial-500 hover:text-memorial-700 hover:border-memorial-300"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={candleName}
              onChange={(e) => setCandleName(e.target.value)}
              placeholder="或自定义命名，如：奶奶的思念灯"
              maxLength={20}
              className={cn(
                "w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-all text-sm",
                theme === "starry"
                  ? "bg-slate-700 text-gray-100 placeholder-gray-500 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                  : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
              )}
            />
          </div>

          <div>
            <label
              className={cn(
                "block text-xs mb-1.5 font-medium",
                theme === "starry" ? "text-gray-400" : "text-memorial-600"
              )}
            >
              寄语（可选）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="写下你的寄语..."
              rows={2}
              className={cn(
                "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
                theme === "starry"
                  ? "bg-slate-700 text-gray-100 placeholder-gray-500 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                  : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
              )}
            />
          </div>

          <label
            className={cn(
              "flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl border transition-colors",
              isEternal
                ? theme === "starry"
                  ? "bg-amber-500/10 border-amber-400/40"
                  : "bg-gold-50 border-gold-300/60"
                : theme === "starry"
                ? "border-slate-600 hover:border-slate-500"
                : "border-memorial-200 hover:border-memorial-300"
            )}
          >
            <button
              type="button"
              onClick={() => setIsEternal(!isEternal)}
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                isEternal
                  ? "bg-gradient-to-br from-amber-400 to-gold-500 border-amber-400"
                  : theme === "starry"
                  ? "border-slate-500"
                  : "border-memorial-300"
              )}
            >
              {isEternal && <Star className="w-3.5 h-3.5 text-white fill-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  isEternal
                    ? theme === "starry"
                      ? "text-amber-200"
                      : "text-gold-700"
                    : theme === "starry"
                    ? "text-gray-200"
                    : "text-memorial-800"
                )}
              >
                <Sparkles
                  className={cn(
                    "w-4 h-4",
                    isEternal
                      ? theme === "starry"
                        ? "text-amber-300"
                        : "text-gold-500"
                      : ""
                  )}
                />
                设为长明灯
              </div>
              <p
                className={cn(
                  "text-[11px] mt-0.5",
                  theme === "starry" ? "text-gray-500" : "text-memorial-400"
                )}
              >
                长明灯将置顶显示，代表永恒的思念
              </p>
            </div>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setShowInput(false);
                setCandleName("");
                setMessage("");
                setIsEternal(false);
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
              onClick={handleLightCandle}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-candle-500 to-gold-500 text-white py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <Flame className="w-4 h-4" />
              点燃蜡烛
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-candle-500 to-gold-500 text-white py-3.5 rounded-xl hover:opacity-90 transition-opacity font-medium"
        >
          <Flame className="w-5 h-5" />
          点燃一盏心灯
        </button>
      )}

      {selectedCandle && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedCandle(null)}
        >
          <div
            className={cn(
              "rounded-2xl p-6 max-w-sm w-full animate-slide-up relative",
              theme === "starry" ? "bg-slate-800" : "bg-white"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCandle(null)}
              className={cn(
                "absolute top-4 right-4 p-1 rounded-full transition-colors",
                theme === "starry"
                  ? "text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  : "text-memorial-400 hover:text-memorial-600 hover:bg-memorial-50"
              )}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              {selectedCandle.isEternal ? (
                <div className="relative w-14 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-gold-400/60 via-amber-400/30 to-transparent blur-lg animate-pulse" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gold-400/20 blur-2xl animate-pulse" style={{ animationDuration: "2s" }} />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute -left-4 -top-3 text-sm text-amber-300 animate-ping" style={{ animationDuration: "1.5s" }}>✦</div>
                      <div className="absolute left-3 -top-2 text-base text-gold-400 animate-pulse" style={{ animationDelay: "0.5s" }}>✧</div>
                      <div className="absolute -left-2 -top-5 text-sm text-amber-200 animate-pulse" style={{ animationDelay: "1s" }}>✦</div>
                    </div>
                    <div className="animate-bounce" style={{ animationDuration: "2s" }}>
                      <Sparkles
                        className={cn(
                          "w-7 h-7",
                          theme === "starry" ? "text-amber-300" : "text-gold-500"
                        )}
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-20 bg-gradient-to-t from-red-700 via-red-600 to-gold-500 rounded-t-sm shadow-xl shadow-gold-500/40" />
                  <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-14 h-4 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-sm shadow-lg" />
                  <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 w-11 h-2 bg-gold-300 rounded-sm" />
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-14 bg-gradient-to-t from-orange-600 via-gold-400 to-yellow-200 rounded-full animate-flicker origin-bottom shadow-2xl shadow-gold-400/60"
                    style={{ filter: "blur(0.3px)" }}
                  />
                  <div
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-5 h-10 bg-gradient-to-t from-orange-400 via-yellow-300 to-white rounded-full animate-flicker origin-bottom"
                    style={{ animationDelay: "0.1s", filter: "blur(0.5px)" }}
                  />
                  <div
                    className="absolute top-9 left-1/2 -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-yellow-200 to-white rounded-full animate-flicker origin-bottom"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-700 rounded-full shadow-lg" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-gradient-to-r from-gold-800 via-gold-600 to-gold-800 rounded-full shadow-xl" />
                </div>
              ) : (
                <div className="relative w-10 h-20 mx-auto mb-6">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-14 bg-gradient-to-t from-candle-400 to-candle-200 rounded-sm" />
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-8 bg-gradient-to-t from-candle-500 via-candle-400 to-yellow-200 rounded-full animate-flicker origin-bottom"
                    style={{ filter: "blur(0.5px)" }}
                  />
                  <div
                    className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3 h-5 bg-gradient-to-t from-orange-400 to-yellow-200 rounded-full animate-flicker origin-bottom"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-candle-500/40 rounded-full" />
                </div>
              )}

              {selectedCandle.isEternal && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mb-3",
                    theme === "starry"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-gold-100 text-gold-700"
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  长明灯
                </span>
              )}

              {selectedCandle.name && (
                <h4
                  className={cn(
                    "font-serif text-lg mb-2",
                    theme === "starry" ? "text-gray-100" : "text-memorial-950"
                  )}
                >
                  {selectedCandle.name}
                </h4>
              )}

              <p
                className={cn(
                  "text-xs mb-4",
                  theme === "starry" ? "text-gray-500" : "text-memorial-400"
                )}
              >
                点燃于 {formatDateTime(selectedCandle.createdAt)}
              </p>

              {selectedCandle.message && (
                <div
                  className={cn(
                    "rounded-xl p-4 text-sm font-serif leading-relaxed",
                    theme === "starry"
                      ? "bg-white/5 text-gray-300"
                      : "bg-memorial-50 text-memorial-700"
                  )}
                >
                  "{selectedCandle.message}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
