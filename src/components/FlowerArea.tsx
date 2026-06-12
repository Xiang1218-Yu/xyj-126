import { useState } from "react";
import { Send, Flower2 } from "lucide-react";
import { getFlowerEmoji } from "@/utils";
import type { Flower } from "@/types";
import Danmaku from "./Danmaku";
import { cn } from "@/lib/utils";

const FLOWER_TYPES = [
  { id: "chrysanthemum", name: "菊花", emoji: "🌼" },
  { id: "rose", name: "玫瑰", emoji: "🌹" },
  { id: "lily", name: "百合", emoji: "🌸" },
  { id: "carnation", name: "康乃馨", emoji: "💮" },
  { id: "sunflower", name: "向日葵", emoji: "🌻" },
  { id: "tulip", name: "郁金香", emoji: "🌷" },
];

interface FlowerAreaProps {
  flowers: Flower[];
  onAddFlower: (type: string, message: string) => void;
  theme?: string;
}

export default function FlowerArea({ flowers, onAddFlower, theme = "default" }: FlowerAreaProps) {
  const [selectedFlower, setSelectedFlower] = useState<string>("chrysanthemum");
  const [message, setMessage] = useState("");
  const [showSelector, setShowSelector] = useState(false);
  const [animatingFlowers, setAnimatingFlowers] = useState<string[]>([]);

  const handleGiveFlower = () => {
    const flowerId = `anim-${Date.now()}`;
    setAnimatingFlowers((prev) => [...prev, flowerId]);
    onAddFlower(selectedFlower, message);
    setMessage("");
    setShowSelector(false);

    setTimeout(() => {
      setAnimatingFlowers((prev) => prev.filter((id) => id !== flowerId));
    }, 1500);
  };

  const displayFlowers = flowers.slice(-30);

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          💐 献花台
        </h3>
        <span
          className={cn(
            "text-sm",
            theme === "starry" ? "text-gray-400" : "text-memorial-500"
          )}
        >
          共 {flowers.length} 束花
        </span>
      </div>

      <div
        className={cn(
          "relative min-h-[160px] rounded-xl p-6 mb-6 overflow-hidden",
          theme === "starry"
            ? "bg-gradient-to-b from-slate-700/50 to-slate-800/50"
            : "bg-gradient-to-b from-memorial-50 to-cream-100"
        )}
      >
        <Danmaku items={flowers} variant="flower" />

        <div className="flex flex-wrap justify-center gap-2">
          {displayFlowers.map((flower, index) => (
            <div
              key={flower.id}
              className="text-2xl flower-float"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              {getFlowerEmoji(flower.type)}
            </div>
          ))}

          {flowers.length === 0 && (
            <div
              className={cn(
                "text-center py-8 w-full",
                theme === "starry" ? "text-gray-500" : "text-memorial-400"
              )}
            >
              <Flower2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">为逝者献上一束鲜花</p>
            </div>
          )}
        </div>

        {animatingFlowers.map((id) => (
          <div
            key={id}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-4xl"
            style={{
              animation: "flowerRise 1.5s ease-out forwards",
            }}
          >
            {getFlowerEmoji(selectedFlower)}
          </div>
        ))}

        <style>{`
          @keyframes flowerRise {
            0% {
              transform: translateX(-50%) translateY(0) scale(0.5);
              opacity: 0;
            }
            20% {
              opacity: 1;
              transform: translateX(-50%) translateY(-20px) scale(1);
            }
            80% {
              opacity: 1;
            }
            100% {
              transform: translateX(-50%) translateY(-100px) scale(0.8);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      {showSelector ? (
        <div className="space-y-4">
          <div>
            <p
              className={cn(
                "text-sm mb-3",
                theme === "starry" ? "text-gray-300" : "text-memorial-600"
              )}
            >
              选择花束
            </p>
            <div className="grid grid-cols-6 gap-2">
              {FLOWER_TYPES.map((flower) => (
                <button
                  key={flower.id}
                  onClick={() => setSelectedFlower(flower.id)}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    selectedFlower === flower.id
                      ? theme === "starry"
                        ? "bg-white/20 ring-2 ring-purple-400"
                        : "bg-memorial-100 ring-2 ring-memorial-400"
                      : theme === "starry"
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-memorial-50 hover:bg-memorial-100"
                  )}
                >
                  <div className="text-2xl mb-1">{flower.emoji}</div>
                  <div
                    className={cn(
                      "text-xs",
                      theme === "starry" ? "text-gray-300" : "text-memorial-600"
                    )}
                  >
                    {flower.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="写下你的寄语（选填）..."
              rows={2}
              className={cn(
                "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
                theme === "starry"
                  ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                  : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
              )}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSelector(false)}
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
              onClick={handleGiveFlower}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl transition-colors text-sm font-medium",
                theme === "starry"
                  ? "bg-purple-600 hover:bg-purple-500"
                  : "bg-memorial-700 hover:bg-memorial-600"
              )}
            >
              <Send className="w-4 h-4" />
              献上花束
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSelector(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl transition-colors font-medium",
            theme === "starry"
              ? "bg-purple-600 hover:bg-purple-500"
              : "bg-memorial-700 hover:bg-memorial-600"
          )}
        >
          <Flower2 className="w-5 h-5" />
          献上一束鲜花
        </button>
      )}
    </div>
  );
}
