import { useState } from "react";
import { Send, Flower2 } from "lucide-react";
import { getFlowerEmoji } from "@/utils";
import type { Flower } from "@/types";
import Danmaku from "./Danmaku";

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
}

export default function FlowerArea({ flowers, onAddFlower }: FlowerAreaProps) {
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
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-memorial-950">💐 献花台</h3>
        <span className="text-memorial-500 text-sm">共 {flowers.length} 束花</span>
      </div>

      <div className="relative min-h-[160px] bg-gradient-to-b from-memorial-50 to-cream-100 rounded-xl p-6 mb-6 overflow-hidden">
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
            <div className="text-center py-8 text-memorial-400 w-full">
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
            <p className="text-sm text-memorial-600 mb-3">选择花束</p>
            <div className="grid grid-cols-6 gap-2">
              {FLOWER_TYPES.map((flower) => (
                <button
                  key={flower.id}
                  onClick={() => setSelectedFlower(flower.id)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedFlower === flower.id
                      ? "bg-memorial-100 ring-2 ring-memorial-400"
                      : "bg-memorial-50 hover:bg-memorial-100"
                  }`}
                >
                  <div className="text-2xl mb-1">{flower.emoji}</div>
                  <div className="text-xs text-memorial-600">{flower.name}</div>
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
              className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all resize-none text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSelector(false)}
              className="px-4 py-2 text-sm text-memorial-500 hover:text-memorial-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleGiveFlower}
              className="flex-1 flex items-center justify-center gap-2 bg-memorial-700 text-white py-2.5 rounded-xl hover:bg-memorial-600 transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              献上花束
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSelector(true)}
          className="w-full flex items-center justify-center gap-2 bg-memorial-700 text-white py-3.5 rounded-xl hover:bg-memorial-600 transition-colors font-medium"
        >
          <Flower2 className="w-5 h-5" />
          献上一束鲜花
        </button>
      )}
    </div>
  );
}
