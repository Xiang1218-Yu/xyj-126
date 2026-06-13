import { useMemo } from "react";
import { getCurrentFestival, type FestivalInfo } from "@/utils";
import { cn } from "@/lib/utils";

interface FestivalDecorationsProps {
  theme?: string;
}

function LanternDecorations() {
  const lanterns = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 5 + (i % 6) * 16 + Math.random() * 5,
      top: i < 6 ? 2 + Math.random() * 3 : 88 + Math.random() * 5,
      size: 28 + Math.random() * 16,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  return (
    <>
      {lanterns.map((l) => (
        <span
          key={l.id}
          className="festival-lantern"
          style={{
            left: `${l.left}%`,
            top: `${l.top}%`,
            fontSize: `${l.size}px`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
          }}
        >
          🏮
        </span>
      ))}
    </>
  );
}

function WillowDecorations() {
  const willowBranches = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: 2 + i * 10 + Math.random() * 5,
      size: 32 + Math.random() * 20,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 3,
    }));
  }, []);

  return (
    <>
      {willowBranches.map((w) => (
        <span
          key={w.id}
          className="festival-willow"
          style={{
            left: `${w.left}%`,
            top: "0%",
            fontSize: `${w.size}px`,
            animationDelay: `${w.delay}s`,
            animationDuration: `${w.duration}s`,
          }}
        >
          🌿
        </span>
      ))}
    </>
  );
}

function MoonDecorations() {
  const stars = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60,
      size: 8 + Math.random() * 10,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    }));
  }, []);

  return (
    <>
      <span
        className="festival-moon"
        style={{
          top: "5%",
          right: "8%",
        }}
      >
        🌕
      </span>
      {stars.map((s) => (
        <span
          key={s.id}
          className="festival-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          ✨
        </span>
      ))}
    </>
  );
}

function ZongziDecorations() {
  const zongzi = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: 5 + (i % 5) * 20 + Math.random() * 8,
      top: i < 5 ? 3 + Math.random() * 4 : 90 + Math.random() * 4,
      size: 24 + Math.random() * 14,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 3,
    }));
  }, []);

  return (
    <>
      {zongzi.map((z) => (
        <span
          key={z.id}
          className="festival-zongzi"
          style={{
            left: `${z.left}%`,
            top: `${z.top}%`,
            fontSize: `${z.size}px`,
            animationDelay: `${z.delay}s`,
            animationDuration: `${z.duration}s`,
          }}
        >
          🫔
        </span>
      ))}
    </>
  );
}

function ChrysanthemumDecorations() {
  const flowers = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 80 + Math.random() * 15,
      size: 22 + Math.random() * 16,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  return (
    <>
      {flowers.map((f) => (
        <span
          key={f.id}
          className="festival-chrysanthemum"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            fontSize: `${f.size}px`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
          }}
        >
          🌼
        </span>
      ))}
    </>
  );
}

function FestivalBadge({ festival, theme }: { festival: FestivalInfo; theme?: string }) {
  const isStarry = theme === "starry";
  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-sm font-medium shadow-md animate-fade-in flex items-center gap-1.5",
        isStarry
          ? "bg-purple-500/30 text-purple-200 border border-purple-400/30"
          : "bg-gradient-to-r from-gold-100 to-cream-100 text-gold-700 border border-gold-300/50"
      )}
    >
      {festival.type === "spring" && "🧧"}
      {festival.type === "qingming" && "🌿"}
      {festival.type === "midautumn" && "🥮"}
      {festival.type === "dragonboat" && "🐉"}
      {festival.type === "yuanxiao" && "🏮"}
      {festival.type === "chongyang" && "🏔️"}
      <span>今日{festival.name}</span>
    </div>
  );
}

export default function FestivalDecorations({ theme }: FestivalDecorationsProps) {
  const festival = useMemo(() => getCurrentFestival(), []);

  if (!festival) return null;

  return (
    <>
      <div className="festival-decorations theme-particles">
        {festival.type === "spring" && <LanternDecorations />}
        {festival.type === "qingming" && <WillowDecorations />}
        {festival.type === "midautumn" && <MoonDecorations />}
        {festival.type === "dragonboat" && <ZongziDecorations />}
        {festival.type === "yuanxiao" && <LanternDecorations />}
        {festival.type === "chongyang" && <ChrysanthemumDecorations />}
      </div>
      <FestivalBadge festival={festival} theme={theme} />
    </>
  );
}
