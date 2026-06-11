import { useState } from "react";
import { Flame, Send } from "lucide-react";
import type { Candle } from "@/types";
import Danmaku from "./Danmaku";

interface CandleAreaProps {
  candles: Candle[];
  onAddCandle: (message: string) => void;
}

export default function CandleArea({ candles, onAddCandle }: CandleAreaProps) {
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
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-memorial-950">🕯️ 点烛台</h3>
        <span className="text-memorial-500 text-sm">共 {candles.length} 盏烛</span>
      </div>

      <div className="relative min-h-[180px] bg-gradient-to-b from-memorial-950/5 to-transparent rounded-xl p-6 mb-6 overflow-hidden">
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
            <div className="text-center py-8 text-memorial-400">
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
            className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all resize-none text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowInput(false)}
              className="px-4 py-2 text-sm text-memorial-500 hover:text-memorial-700 transition-colors"
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
