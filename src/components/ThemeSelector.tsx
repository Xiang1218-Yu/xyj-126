import { useState } from "react";
import { Palette, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { VisualTheme } from "@/types";

interface ThemeParticlesProps {
  theme: VisualTheme;
}

function ThemeParticles({ theme }: ThemeParticlesProps) {
  if (theme === "default") return null;

  if (theme === "sakura") {
    const petals = Array.from({ length: 20 });
    return (
      <div className="theme-particles">
        {petals.map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = 8 + Math.random() * 8;
          const size = 14 + Math.random() * 10;
          return (
            <span
              key={i}
              className="particle particle-sakura"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                fontSize: `${size}px`,
              }}
            >
              🌸
            </span>
          );
        })}
      </div>
    );
  }

  if (theme === "autumn") {
    const leaves = Array.from({ length: 18 });
    const leafEmojis = ["🍂", "🍁", "🍃"];
    return (
      <div className="theme-particles">
        {leaves.map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = 10 + Math.random() * 10;
          const size = 16 + Math.random() * 12;
          const emoji = leafEmojis[i % leafEmojis.length];
          return (
            <span
              key={i}
              className="particle particle-leaf"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                fontSize: `${size}px`,
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>
    );
  }

  if (theme === "snow") {
    const flakes = Array.from({ length: 40 });
    const snowEmojis = ["❄️", "❅", "❆"];
    return (
      <div className="theme-particles">
        {flakes.map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          const duration = 6 + Math.random() * 8;
          const size = 10 + Math.random() * 14;
          const emoji = snowEmojis[i % snowEmojis.length];
          return (
            <span
              key={i}
              className="particle particle-snow"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                fontSize: `${size}px`,
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>
    );
  }

  if (theme === "starry") {
    const stars = Array.from({ length: 60 });
    const sizes = ["", "medium", "large"];
    return (
      <div className="theme-particles">
        {stars.map((_, i) => {
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = 2 + Math.random() * 4;
          const sizeClass = sizes[i % sizes.length];
          return (
            <span
              key={i}
              className={cn("particle particle-star", sizeClass)}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>
    );
  }

  return null;
}

export { ThemeParticles };

export default function ThemeSelector() {
  const { theme, setTheme, THEME_LIST } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 rounded-full transition-colors",
            theme === "starry"
              ? "hover:bg-white/10 text-gray-200"
              : "hover:bg-memorial-100 text-memorial-600"
          )}
          title="切换主题"
        >
          <Palette className="w-5 h-5" />
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute right-0 top-10 rounded-xl shadow-lg py-2 min-w-[200px] z-50 animate-fade-in",
              theme === "starry"
                ? "bg-slate-800/95 border border-slate-600"
                : "bg-white border border-memorial-100"
            )}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-opacity-30"
              style={{
                borderColor: theme === "starry" ? "rgba(148, 163, 184, 0.3)" : "rgba(232, 235, 228, 0.8)",
              }}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  theme === "starry" ? "text-gray-200" : "text-memorial-700"
                )}
              >
                视觉主题
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  theme === "starry"
                    ? "hover:bg-white/10 text-gray-400"
                    : "hover:bg-memorial-100 text-memorial-500"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {THEME_LIST.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-left",
                      isActive
                        ? theme === "starry"
                          ? "bg-white/15"
                          : "bg-memorial-100"
                        : theme === "starry"
                        ? "hover:bg-white/10"
                        : "hover:bg-memorial-50"
                    )}
                  >
                    <span className="text-2xl flex-shrink-0">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          theme === "starry" ? "text-gray-100" : "text-memorial-800"
                        )}
                      >
                        {t.name}
                      </div>
                      <div
                        className={cn(
                          "text-xs truncate",
                          theme === "starry" ? "text-gray-400" : "text-memorial-500"
                        )}
                      >
                        {t.description}
                      </div>
                    </div>
                    {isActive && (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          theme === "starry" ? "bg-purple-400" : "bg-memorial-600"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ThemeParticles theme={theme} />
    </>
  );
}
