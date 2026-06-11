import { useState, useEffect, useMemo } from "react";

interface DanmakuItemBase {
  id: string;
  message: string;
}

interface DanmakuProps<T extends DanmakuItemBase> {
  items: T[];
  variant?: "flower" | "candle";
  speed?: "slow" | "normal" | "fast";
  maxItems?: number;
}

export default function Danmaku<T extends DanmakuItemBase>({
  items,
  variant = "flower",
  speed = "slow",
  maxItems = 5,
}: DanmakuProps<T>) {
  const [visibleItems, setVisibleItems] = useState<
    { id: string; message: string; top: number; duration: number; delay: number }[]
  >([]);

  const messagesWithText = useMemo(
    () => items.filter((item) => item.message && item.message.trim().length > 0),
    [items]
  );

  useEffect(() => {
    if (messagesWithText.length === 0) {
      setVisibleItems([]);
      return;
    }

    const generateDanmaku = () => {
      const count = Math.min(maxItems, messagesWithText.length);
      const selected: typeof visibleItems = [];
      const usedIndices = new Set<number>();

      for (let i = 0; i < count; i++) {
        let idx: number;
        do {
          idx = Math.floor(Math.random() * messagesWithText.length);
        } while (usedIndices.has(idx) && usedIndices.size < messagesWithText.length);
        usedIndices.add(idx);

        const item = messagesWithText[idx];
        const top = 10 + Math.random() * 70;

        let duration: number;
        switch (speed) {
          case "fast":
            duration = 6 + Math.random() * 4;
            break;
          case "normal":
            duration = 10 + Math.random() * 5;
            break;
          case "slow":
          default:
            duration = 14 + Math.random() * 8;
            break;
        }

        const delay = Math.random() * 3;

        selected.push({
          id: `${item.id}-${Date.now()}-${i}`,
          message: item.message,
          top,
          duration,
          delay,
        });
      }

      setVisibleItems(selected);
    };

    generateDanmaku();

    const interval = setInterval(generateDanmaku, 12000);

    return () => clearInterval(interval);
  }, [messagesWithText, speed, maxItems]);

  const colorClass =
    variant === "candle"
      ? "text-gold-700 bg-gold-50/80 border-gold-200/60"
      : "text-memorial-700 bg-cream-50/80 border-memorial-200/60";

  if (messagesWithText.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className={`absolute px-3 py-1.5 rounded-full text-xs border whitespace-nowrap danmaku-item ${colorClass}`}
          style={{
            top: `${item.top}%`,
            right: 0,
            animation: `danmakuScroll ${item.duration}s linear ${item.delay}s forwards`,
            opacity: 0,
            maxWidth: "70%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.message}
        </div>
      ))}

      <style>{`
        @keyframes danmakuScroll {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(calc(-100vw - 100%));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
