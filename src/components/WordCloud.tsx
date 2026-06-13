import { useState, useMemo, useCallback } from "react";
import { Cloud, X, ExternalLink } from "lucide-react";
import type { Message, Flower, Candle } from "@/types";
import { cn } from "@/lib/utils";

interface TextSource {
  type: "message" | "flower" | "candle" | "biography" | "epitaph";
  id: string;
  label: string;
  excerpt: string;
  author?: string;
}

interface WordItem {
  word: string;
  count: number;
  sources: TextSource[];
}

interface WordCloudProps {
  messages: Message[];
  flowers: Flower[];
  candles: Candle[];
  biography: string;
  epitaph: string;
  theme?: string;
}

const STOP_WORDS = new Set([
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
  "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有",
  "看", "好", "自己", "这", "他", "她", "它", "们", "那", "些", "什么",
  "吗", "吧", "啊", "呢", "哦", "嗯", "呀", "哈", "么", "把", "被", "让",
  "给", "从", "向", "对", "与", "而", "但", "或", "如果", "因为", "所以",
  "可以", "能", "得", "地", "过", "还", "又", "再", "才", "已", "以",
  "之", "其", "此", "个", "中", "里", "下", "来", "去", "起", "出",
  "多", "少", "大", "小", "时", "后", "前", "然", "当", "于", "为",
  "等", "更", "最", "将", "只", "比", "每", "次", "位", "件", "种",
  "样", "代", "里", "年", "月", "日", "号", "第", "及", "该",
]);

const TYPE_LABELS: Record<TextSource["type"], string> = {
  message: "留言",
  flower: "献花寄语",
  candle: "点烛寄语",
  biography: "生平介绍",
  epitaph: "墓志铭",
};

const TYPE_ICONS: Record<TextSource["type"], string> = {
  message: "💬",
  flower: "💐",
  candle: "🕯️",
  biography: "📖",
  epitaph: "✨",
};

declare global {
  namespace Intl {
    class Segmenter {
      constructor(locale: string, options?: { granularity?: "grapheme" | "word" | "sentence" });
      segment(text: string): Iterable<{ segment: string; isWordLike: boolean }>;
    }
  }
}

function segmentChineseText(text: string): string[] {
  const words: string[] = [];
  if (typeof Intl !== "undefined" && typeof (Intl as typeof Intl & { Segmenter?: typeof Intl.Segmenter }).Segmenter !== "undefined") {
    const segmenter = new (Intl as typeof Intl & { Segmenter: typeof Intl.Segmenter }).Segmenter("zh-CN", { granularity: "word" });
    const segments = segmenter.segment(text);
    for (const seg of segments) {
      if (seg.isWordLike) {
        const w = seg.segment.trim();
        if (w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)) {
          words.push(w);
        }
      }
    }
  } else {
    const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, " ");
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      if (t.length >= 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t)) {
        words.push(t);
      }
    }
  }
  return words;
}

function truncateText(text: string, maxLen: number = 60): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + "...";
}

function extractSourcesAndWords(
  messages: Message[],
  flowers: Flower[],
  candles: Candle[],
  biography: string,
  epitaph: string
): WordItem[] {
  const wordMap = new Map<string, { count: number; sources: TextSource[] }>();

  const addWord = (word: string, source: TextSource) => {
    const existing = wordMap.get(word);
    if (existing) {
      existing.count += 1;
      if (existing.sources.length < 10 && !existing.sources.some((s) => s.id === source.id && s.type === source.type)) {
        existing.sources.push(source);
      }
    } else {
      wordMap.set(word, { count: 1, sources: [source] });
    }
  };

  for (const msg of messages) {
    if (!msg.content?.trim()) continue;
    const source: TextSource = {
      type: "message",
      id: msg.id,
      label: `${msg.author}的留言`,
      excerpt: truncateText(msg.content),
      author: msg.author,
    };
    for (const w of segmentChineseText(msg.content)) {
      addWord(w, source);
    }
  }

  for (const flower of flowers) {
    if (!flower.message?.trim()) continue;
    const source: TextSource = {
      type: "flower",
      id: flower.id,
      label: "献花寄语",
      excerpt: truncateText(flower.message),
    };
    for (const w of segmentChineseText(flower.message)) {
      addWord(w, source);
    }
  }

  for (const candle of candles) {
    if (!candle.message?.trim()) continue;
    const source: TextSource = {
      type: "candle",
      id: candle.id,
      label: "点烛寄语",
      excerpt: truncateText(candle.message),
    };
    for (const w of segmentChineseText(candle.message)) {
      addWord(w, source);
    }
  }

  if (biography?.trim()) {
    const lines = biography.split(/\n+/).filter((l) => l.trim());
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const source: TextSource = {
        type: "biography",
        id: `bio-${i}`,
        label: "生平介绍",
        excerpt: truncateText(line),
      };
      for (const w of segmentChineseText(line)) {
        addWord(w, source);
      }
    }
  }

  if (epitaph?.trim()) {
    const source: TextSource = {
      type: "epitaph",
      id: "epitaph",
      label: "墓志铭",
      excerpt: truncateText(epitaph),
    };
    for (const w of segmentChineseText(epitaph)) {
      addWord(w, source);
    }
  }

  return Array.from(wordMap.entries())
    .map(([word, data]) => ({ word, ...data }))
    .sort((a, b) => b.count - a.count);
}

const CLOUD_COLORS_LIGHT = [
  "text-memorial-700",
  "text-memorial-600",
  "text-memorial-500",
  "text-gold-700",
  "text-gold-600",
  "text-amber-700",
  "text-amber-600",
  "text-rose-600",
  "text-rose-500",
  "text-purple-600",
  "text-purple-500",
  "text-sky-600",
];

const CLOUD_COLORS_DARK = [
  "text-amber-300",
  "text-amber-200",
  "text-purple-300",
  "text-purple-200",
  "text-rose-300",
  "text-rose-200",
  "text-sky-300",
  "text-sky-200",
  "text-emerald-300",
  "text-emerald-200",
  "text-pink-300",
  "text-pink-200",
];

export default function WordCloud({
  messages,
  flowers,
  candles,
  biography,
  epitaph,
  theme = "default",
}: WordCloudProps) {
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  const wordItems = useMemo(
    () => extractSourcesAndWords(messages, flowers, candles, biography, epitaph),
    [messages, flowers, candles, biography, epitaph]
  );

  const displayWords = useMemo(() => {
    const top = wordItems.slice(0, 60);
    if (top.length === 0) return [];
    const maxCount = top[0].count;
    const minCount = top[top.length - 1].count;
    return top.map((item, index) => {
      const range = maxCount - minCount || 1;
      const ratio = (item.count - minCount) / range;
      const fontSize = 0.75 + ratio * 2.5;
      const colors = theme === "starry" ? CLOUD_COLORS_DARK : CLOUD_COLORS_LIGHT;
      return {
        ...item,
        fontSize,
        color: colors[index % colors.length],
        rotation: (index * 7) % 2 === 0 ? -3 + (index % 7) : 3 - (index % 5),
      };
    });
  }, [wordItems, theme]);

  const handleWordClick = useCallback((item: WordItem & { fontSize: number; color: string; rotation: number }) => {
    setSelectedWord(item);
  }, []);

  const totalTexts = messages.length + flowers.filter((f) => f.message?.trim()).length + candles.filter((c) => c.message?.trim()).length + (biography?.trim() ? 1 : 0) + (epitaph?.trim() ? 1 : 0);

  if (wordItems.length === 0) {
    return (
      <div className="theme-card rounded-2xl p-6 shadow-sm">
        <h3
          className={cn(
            "font-serif text-xl mb-4",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          <Cloud className={cn("w-5 h-5 inline mr-2", theme === "starry" ? "text-gray-400" : "text-memorial-500")} />
          主题词云
        </h3>
        <div className={cn("text-center py-12", theme === "starry" ? "text-gray-500" : "text-memorial-400")}>
          <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无文本内容，添加留言或生平介绍后生成词云</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          <Cloud className={cn("w-5 h-5 inline mr-2", theme === "starry" ? "text-gray-400" : "text-memorial-500")} />
          主题词云
        </h3>
        <span className={cn("text-sm", theme === "starry" ? "text-gray-400" : "text-memorial-500")}>
          来自 {totalTexts} 条文本 · {wordItems.length} 个词
        </span>
      </div>

      <div
        className={cn(
          "relative min-h-[240px] rounded-xl p-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3",
          theme === "starry"
            ? "bg-gradient-to-br from-slate-800/50 via-purple-900/20 to-slate-800/50"
            : "bg-gradient-to-br from-memorial-50/80 via-cream-50 to-memorial-50/80"
        )}
      >
        {displayWords.map((item, index) => (
          <button
            key={item.word}
            onClick={() => handleWordClick(item)}
            className={cn(
              "inline-block transition-all duration-200 hover:scale-110 hover:opacity-90 cursor-pointer font-serif",
              item.color,
              selectedWord?.word === item.word && "ring-2 ring-offset-1 rounded px-1",
              selectedWord?.word === item.word && (theme === "starry" ? "ring-purple-400 ring-offset-slate-800" : "ring-memorial-400 ring-offset-white")
            )}
            style={{
              fontSize: `${item.fontSize}rem`,
              lineHeight: 1.3,
              transform: `rotate(${item.rotation}deg)`,
              animationDelay: `${index * 0.03}s`,
            }}
            title={`${item.word}：出现 ${item.count} 次，点击查看来源`}
          >
            {item.word}
          </button>
        ))}
      </div>

      <p
        className={cn(
          "text-xs mt-3 text-center",
          theme === "starry" ? "text-gray-500" : "text-memorial-400"
        )}
      >
        点击词汇查看来源
      </p>

      {selectedWord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedWord(null)}>
          <div
            className={cn(
              "rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in",
              theme === "starry" ? "bg-slate-800 border border-slate-600" : "bg-white"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "font-serif text-3xl font-medium",
                    theme === "starry" ? "text-amber-300" : "text-memorial-800"
                  )}
                >
                  {selectedWord.word}
                </span>
                <span
                  className={cn(
                    "text-sm px-2.5 py-1 rounded-full",
                    theme === "starry"
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-memorial-100 text-memorial-600"
                  )}
                >
                  出现 {selectedWord.count} 次
                </span>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  theme === "starry" ? "hover:bg-white/10 text-gray-400" : "hover:bg-memorial-100 text-memorial-400"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4
                className={cn(
                  "text-sm font-medium mb-2",
                  theme === "starry" ? "text-gray-300" : "text-memorial-600"
                )}
              >
                <ExternalLink className="w-3.5 h-3.5 inline mr-1.5" />
                来源明细
              </h4>
              {selectedWord.sources.map((source, index) => (
                <div
                  key={`${source.type}-${source.id}-${index}`}
                  className={cn(
                    "p-3.5 rounded-xl border",
                    theme === "starry"
                      ? "bg-white/5 border-slate-700 hover:bg-white/10"
                      : "bg-memorial-50/50 border-memorial-100 hover:bg-memorial-50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{TYPE_ICONS[source.type]}</span>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        theme === "starry"
                          ? "bg-white/10 text-gray-300"
                          : "bg-memorial-100 text-memorial-600"
                      )}
                    >
                      {TYPE_LABELS[source.type]}
                    </span>
                    {source.author && (
                      <span
                        className={cn(
                          "text-xs",
                          theme === "starry" ? "text-gray-400" : "text-memorial-500"
                        )}
                      >
                        — {source.author}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-relaxed font-serif",
                      theme === "starry" ? "text-gray-300" : "text-memorial-700"
                    )}
                  >
                    {highlightWord(source.excerpt, selectedWord.word, theme)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function highlightWord(text: string, word: string, theme: string): React.ReactNode {
  const parts = text.split(word);
  if (parts.length === 1) return text;

  const elements: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    elements.push(part);
    if (i < parts.length - 1) {
      elements.push(
        <mark
          key={i}
          className={cn(
            "rounded px-0.5",
            theme === "starry"
              ? "bg-amber-500/30 text-amber-200"
              : "bg-gold-200/80 text-gold-800"
          )}
        >
          {word}
        </mark>
      );
    }
  });
  return <>{elements}</>;
}
