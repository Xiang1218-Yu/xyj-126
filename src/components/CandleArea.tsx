import { useState } from "react";
import { Flame, Send } from "lucide-react";
import type { Candle } from "@/types";
import Danmaku from "./Danmaku";
import { cn } from "@/lib/utils";

interface CandleAreaProps {
  candles: Candle[];
  onAddCandle: (message: string) => void;
  theme?: string;
}

export default function CandleArea({ candles, onAddCandle, theme = "default" }: CandleAreaProps) {
  const [message, setMessage] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLightCandle = () => {
    setIsAnimating(true);
    onAddCandle(message);
    setMessage("");
    setShowInput(false);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const displayCandles = candles.slice(-20);

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          🕯️ 点烛台
        </h3>
        <span
          className={cn(
            "text-sm",
            theme === "starry" ? "text-gray-400" : "text-memorial-500"
          )}
        >
          共 {candles.length} 盏烛
        </span>
      </div>

      <div
        className={cn(
          "relative min-h-[180px] rounded-xl p-6 mb-6 overflow-hidden",
          theme === "starry"
            ? "bg-gradient-to-b from-slate-700/30 to-transparent"
            : "bg-gradient-to-b from-memorial-950/5 to-transparent"
        )}
      >
        <Danmaku items={candles} variant="candle" />

        <div className="flex flex-wrap justify-center gap-4">
          {displayCandles.map((candle, index) => (
            <div
              key={candle.id}
              className="flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              <div className="relative w-6 h-16 candle-glow">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-10 bg-gradient-to-t from-candle-300 to-candle-200 rounded-sm" />
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-candle-500 via-candle-400 to-yellow-200 rounded-full animate-flicker origin-bottom"
                  style={{ filter: "blur(0.5px)" }}
                />
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-gradient-to-t from-orange-400 to-yellow-200 rounded-full animate-flicker origin-bottom"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
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
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="写下你的寄语..."
            rows={2}
            className={cn(
              "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
              theme === "starry"
                ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
            )}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowInput(false)}
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
    </div>
  );
}
