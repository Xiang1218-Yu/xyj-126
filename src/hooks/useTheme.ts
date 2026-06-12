import { useState, useEffect } from "react";
import type { VisualTheme, ThemeConfig } from "@/types";

export const THEME_CONFIGS: Record<VisualTheme, ThemeConfig> = {
  default: {
    id: "default",
    name: "素雅",
    icon: "🌿",
    description: "简约典雅的传统风格",
    bgGradient: "linear-gradient(180deg, #faf7f0 0%, #f5efe1 100%)",
    textPrimary: "#1a3a2f",
    textSecondary: "#6f7e61",
    accent: "#55644a",
    cardBg: "rgba(255, 255, 255, 0.9)",
    cardBorder: "#e8ebe4",
  },
  sakura: {
    id: "sakura",
    name: "春樱",
    icon: "🌸",
    description: "粉樱飘零，温柔思念",
    bgGradient: "linear-gradient(180deg, #fff5f7 0%, #ffe4ec 50%, #ffd1dc 100%)",
    textPrimary: "#4a2c3a",
    textSecondary: "#a65c7a",
    accent: "#d87093",
    cardBg: "rgba(255, 255, 255, 0.85)",
    cardBorder: "#ffc8d8",
  },
  autumn: {
    id: "autumn",
    name: "秋叶",
    icon: "🍂",
    description: "金色秋叶，回忆绵长",
    bgGradient: "linear-gradient(180deg, #fff8e7 0%, #ffe8c8 50%, #f5c896 100%)",
    textPrimary: "#4a2c1a",
    textSecondary: "#a0522d",
    accent: "#c87533",
    cardBg: "rgba(255, 253, 248, 0.9)",
    cardBorder: "#e8c99b",
  },
  snow: {
    id: "snow",
    name: "雪景",
    icon: "❄️",
    description: "白雪皑皑，静谧安宁",
    bgGradient: "linear-gradient(180deg, #f0f7ff 0%, #dcebf8 50%, #c5dbed 100%)",
    textPrimary: "#1e3a5f",
    textSecondary: "#4a6fa5",
    accent: "#3b6ea8",
    cardBg: "rgba(255, 255, 255, 0.92)",
    cardBorder: "#d0e0f0",
  },
  starry: {
    id: "starry",
    name: "星空",
    icon: "✨",
    description: "繁星点点，遥寄思念",
    bgGradient: "linear-gradient(180deg, #0f1937 0%, #1a2547 50%, #2a3a5f 100%)",
    textPrimary: "#e8ecf5",
    textSecondary: "#9ca8c8",
    accent: "#c4b5fd",
    cardBg: "rgba(30, 40, 70, 0.85)",
    cardBorder: "#3a4a70",
  },
};

export const THEME_LIST: ThemeConfig[] = Object.values(THEME_CONFIGS);

const STORAGE_KEY = "memorial_visual_theme";

export function useTheme() {
  const [theme, setTheme] = useState<VisualTheme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as VisualTheme;
    if (savedTheme && THEME_CONFIGS[savedTheme]) {
      return savedTheme;
    }
    return "default";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const themeConfig = THEME_CONFIGS[theme];

  return {
    theme,
    themeConfig,
    setTheme,
    THEME_LIST,
  };
}
