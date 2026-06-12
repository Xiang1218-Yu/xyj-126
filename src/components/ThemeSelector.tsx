import { useState } from "react";
import { Palette, X, Lock } from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { THEME_LIST, getThemeConfig } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { verifyPassword } from "@/utils";
import type { VisualTheme } from "@/types";

interface ThemeParticlesProps {
  theme: VisualTheme;
}

export function ThemeParticles({ theme }: ThemeParticlesProps) {
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

interface ThemePasswordModalProps {
  onSubmit: (password: string) => Promise<boolean>;
  onCancel: () => void;
  theme: VisualTheme;
}

function ThemePasswordModal({ onSubmit, onCancel, theme }: ThemePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("请输入管理密码");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const isValid = await onSubmit(password);
    if (!isValid) {
      setError("密码错误，请重试");
    }
    setIsSubmitting(false);
  };

  const isStarry = theme === "starry";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className={cn(
          "rounded-2xl p-6 max-w-sm w-full animate-fade-in",
          isStarry ? "bg-slate-800" : "bg-white"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock className={cn("w-5 h-5", isStarry ? "text-amber-400" : "text-gold-600")} />
          <h3 className={cn("font-serif text-xl", isStarry ? "text-gray-100" : "text-memorial-950")}>
            管理验证
          </h3>
        </div>
        <p className={cn("mb-6 text-sm", isStarry ? "text-gray-300" : "text-memorial-600")}>
          切换主题需要管理权限，请输入管理密码
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="请输入管理密码"
            className={cn(
              "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all mb-2",
              isStarry
                ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
            )}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-xs mb-3">{error}</p>
          )}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "flex-1 py-3 border rounded-xl transition-colors text-sm",
                isStarry
                  ? "border-slate-600 text-gray-300 hover:bg-white/10"
                  : "border-memorial-200 text-memorial-700 hover:bg-memorial-50"
              )}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className={cn(
                "flex-1 py-3 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50",
                isStarry ? "bg-purple-600 hover:bg-purple-500" : "bg-memorial-700 hover:bg-memorial-600"
              )}
            >
              {isSubmitting ? "验证中..." : "确认"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ThemeSelectorProps {
  memorialId: string;
  currentTheme: VisualTheme;
  adminPasswordHash: string;
}

export default function ThemeSelector({
  memorialId,
  currentTheme,
  adminPasswordHash,
}: ThemeSelectorProps) {
  const { setMemorialTheme } = useMemorialStore();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<VisualTheme | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const themeConfig = getThemeConfig(currentTheme);
  const isStarry = currentTheme === "starry";

  const handleThemeSelect = (newTheme: VisualTheme) => {
    if (newTheme === currentTheme) {
      setIsOpen(false);
      return;
    }

    if (adminPasswordHash) {
      setPendingTheme(newTheme);
      setShowPasswordModal(true);
      setIsOpen(false);
    } else {
      setMemorialTheme(memorialId, newTheme);
      setIsOpen(false);
    }
  };

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password, adminPasswordHash);
    if (isValid && pendingTheme) {
      setMemorialTheme(memorialId, pendingTheme);
      setPendingTheme(null);
      setShowPasswordModal(false);
      return true;
    }
    return false;
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "p-2 rounded-full transition-colors",
            isStarry
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
              isStarry
                ? "bg-slate-800/95 border border-slate-600"
                : "bg-white border border-memorial-100"
            )}
          >
            <div
              className="flex items-center justify-between px-4 py-2 border-b border-opacity-30"
              style={{
                borderColor: isStarry
                  ? "rgba(148, 163, 184, 0.3)"
                  : "rgba(232, 235, 228, 0.8)",
              }}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  isStarry ? "text-gray-200" : "text-memorial-700"
                )}
              >
                纪念页主题
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  isStarry
                    ? "hover:bg-white/10 text-gray-400"
                    : "hover:bg-memorial-100 text-memorial-500"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {THEME_LIST.map((t) => {
                const isActive = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeSelect(t.id)}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-left",
                      isActive
                        ? isStarry
                          ? "bg-white/15"
                          : "bg-memorial-100"
                        : isStarry
                        ? "hover:bg-white/10"
                        : "hover:bg-memorial-50"
                    )}
                  >
                    <span className="text-2xl flex-shrink-0">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isStarry ? "text-gray-100" : "text-memorial-800"
                        )}
                      >
                        {t.name}
                      </div>
                      <div
                        className={cn(
                          "text-xs truncate",
                          isStarry ? "text-gray-400" : "text-memorial-500"
                        )}
                      >
                        {t.description}
                      </div>
                    </div>
                    {isActive && (
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          isStarry ? "bg-purple-400" : "bg-memorial-600"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {adminPasswordHash && (
              <div
                className={cn(
                  "px-4 py-2 border-t flex items-center gap-1.5 text-xs",
                  isStarry
                    ? "border-slate-600 text-gray-500"
                    : "border-memorial-100 text-memorial-400"
                )}
              >
                <Lock className="w-3 h-3" />
                切换主题需验证管理密码
              </div>
            )}
          </div>
        )}
      </div>

      <ThemeParticles theme={currentTheme} />

      {showPasswordModal && (
        <ThemePasswordModal
          theme={currentTheme}
          onSubmit={handlePasswordSubmit}
          onCancel={() => {
            setShowPasswordModal(false);
            setPendingTheme(null);
          }}
        />
      )}
    </>
  );
}
