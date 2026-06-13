import { useState } from "react";
import { Send, Flower2, Plus, Minus, Gift, Info } from "lucide-react";
import { getFlowerEmoji, getFlowerItemsDisplay, getTotalFlowerCount } from "@/utils";
import type { Flower, FlowerItem, WrapperStyle } from "@/types";
import { FLOWER_TYPES, WRAPPER_STYLES } from "@/types";
import Danmaku from "./Danmaku";
import { cn } from "@/lib/utils";

interface FlowerAreaProps {
  flowers: Flower[];
  onAddFlower: (data: { type: string; message: string; items?: FlowerItem[]; wrapperStyle?: string }) => void;
  theme?: string;
}

export default function FlowerArea({ flowers, onAddFlower, theme = "default" }: FlowerAreaProps) {
  const [message, setMessage] = useState("");
  const [showSelector, setShowSelector] = useState(false);
  const [animatingFlowers, setAnimatingFlowers] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({ chrysanthemum: 1 });
  const [selectedWrapper, setSelectedWrapper] = useState<string>("white");
  const [hoveredFlower, setHoveredFlower] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const totalFlowers = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);

  const updateQuantity = (type: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[type] || 0;
      const newQty = Math.max(0, Math.min(99, current + delta));
      if (newQty === 0) {
        const { [type]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [type]: newQty };
    });
  };

  const getSelectedItemsList = (): FlowerItem[] => {
    return Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([type, quantity]) => ({ type, quantity }));
  };

  const getPrimaryFlowerType = (): string => {
    const items = getSelectedItemsList();
    if (items.length === 0) return "chrysanthemum";
    return items.reduce((max, item) => (item.quantity > max.quantity ? item : max), items[0]).type;
  };

  const handleGiveFlower = () => {
    if (totalFlowers === 0) return;

    const flowerId = `anim-${Date.now()}`;
    setAnimatingFlowers((prev) => [...prev, flowerId]);

    const items = getSelectedItemsList();
    const primaryType = getPrimaryFlowerType();

    onAddFlower({
      type: primaryType,
      message,
      items,
      wrapperStyle: selectedWrapper,
    });

    setMessage("");
    setSelectedItems({ chrysanthemum: 1 });
    setSelectedWrapper("white");
    setShowSelector(false);
    setCurrentStep(1);

    setTimeout(() => {
      setAnimatingFlowers((prev) => prev.filter((id) => id !== flowerId));
    }, 1500);
  };

  const displayFlowers = flowers.slice(-30);

  const renderFlowerItem = (flower: Flower) => {
    if (flower.items && flower.items.length > 0) {
      return (
        <div className="flex flex-wrap gap-0.5 items-center justify-center">
          {flower.items.map((item, idx) => (
            <span key={idx} className="text-lg">
              {getFlowerEmoji(item.type)}
              {item.quantity > 1 && (
                <span className="text-xs opacity-70">×{item.quantity}</span>
              )}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-2xl">{getFlowerEmoji(flower.type)}</span>;
  };

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

        <div className="flex flex-wrap justify-center gap-3">
          {displayFlowers.map((flower, index) => {
            const wrapper = flower.wrapperStyle ? WRAPPER_STYLES.find((w) => w.id === flower.wrapperStyle) : null;
            return (
              <div
                key={flower.id}
                className={cn(
                  "p-2 rounded-lg flower-float",
                  wrapper?.pattern || "bg-white/50"
                )}
                style={{ animationDelay: `${index * 0.3}s` }}
                title={getFlowerItemsDisplay(flower.items)}
              >
                {renderFlowerItem(flower)}
              </div>
            );
          })}

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
            {getFlowerEmoji(getPrimaryFlowerType())}
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
        <div className="space-y-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step as 1 | 2 | 3)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    currentStep === step
                      ? theme === "starry"
                        ? "bg-purple-600 text-white"
                        : "bg-memorial-700 text-white"
                      : theme === "starry"
                      ? "bg-white/10 text-gray-300 hover:bg-white/20"
                      : "bg-memorial-100 text-memorial-600 hover:bg-memorial-200"
                  )}
                >
                  {step === 1 ? "🌸 选花" : step === 2 ? "🎁 包装" : "💌 寄语"}
                </button>
              ))}
            </div>
            <div
              className={cn(
                "text-sm font-medium",
                theme === "starry" ? "text-purple-400" : "text-memorial-600"
              )}
            >
              共 {totalFlowers} 朵
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <p
                className={cn(
                  "text-sm",
                  theme === "starry" ? "text-gray-300" : "text-memorial-600"
                )}
              >
                选择花束组合（可多选，调整数量）
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FLOWER_TYPES.map((flower) => {
                  const qty = selectedItems[flower.id] || 0;
                  return (
                    <div
                      key={flower.id}
                      className={cn(
                        "relative p-4 rounded-xl transition-all border-2",
                        qty > 0
                          ? theme === "starry"
                            ? "bg-white/10 border-purple-400"
                            : "bg-memorial-50 border-memorial-400"
                          : theme === "starry"
                          ? "bg-white/5 border-transparent hover:bg-white/10"
                          : "bg-memorial-50/50 border-transparent hover:bg-memorial-100"
                      )}
                      onMouseEnter={() => setHoveredFlower(flower.id)}
                      onMouseLeave={() => setHoveredFlower(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{flower.emoji}</span>
                        {hoveredFlower === flower.id && (
                          <div
                            className={cn(
                              "absolute -top-2 -right-2 p-1.5 rounded-full cursor-help z-10",
                              theme === "starry" ? "bg-slate-600" : "bg-white shadow-md"
                            )}
                            title={flower.meaning}
                          >
                            <Info
                              className={cn(
                                "w-3 h-3",
                                theme === "starry" ? "text-gray-300" : "text-memorial-500"
                              )}
                            />
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium mb-1",
                          theme === "starry" ? "text-gray-100" : "text-memorial-800"
                        )}
                      >
                        {flower.name}
                      </div>
                      <div
                        className={cn(
                          "text-xs mb-3 h-8 overflow-hidden",
                          theme === "starry" ? "text-gray-400" : "text-memorial-500"
                        )}
                      >
                        {flower.meaning}
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => updateQuantity(flower.id, -1)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            theme === "starry"
                              ? "bg-white/10 hover:bg-white/20 text-gray-300"
                              : "bg-memorial-100 hover:bg-memorial-200 text-memorial-600"
                          )}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className={cn(
                            "text-lg font-bold w-8 text-center",
                            theme === "starry" ? "text-white" : "text-memorial-800"
                          )}
                        >
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(flower.id, 1)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            theme === "starry"
                              ? "bg-white/10 hover:bg-white/20 text-gray-300"
                              : "bg-memorial-100 hover:bg-memorial-200 text-memorial-600"
                          )}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p
                className={cn(
                  "text-sm",
                  theme === "starry" ? "text-gray-300" : "text-memorial-600"
                )}
              >
                选择花束包装纸
              </p>
              <div className="grid grid-cols-5 gap-3">
                {WRAPPER_STYLES.map((wrapper) => (
                  <button
                    key={wrapper.id}
                    onClick={() => setSelectedWrapper(wrapper.id)}
                    className={cn(
                      "p-3 rounded-xl transition-all border-2",
                      wrapper.pattern,
                      selectedWrapper === wrapper.id
                        ? theme === "starry"
                          ? "border-purple-400 ring-2 ring-purple-400/30"
                          : "border-memorial-400 ring-2 ring-memorial-400/30"
                        : theme === "starry"
                        ? "border-white/10 hover:border-white/30"
                        : "border-transparent hover:border-memorial-200"
                    )}
                  >
                    <div
                      className="w-full aspect-square rounded-lg mb-2"
                      style={{ backgroundColor: wrapper.color }}
                    />
                    <div
                      className={cn(
                        "text-xs font-medium text-center",
                        theme === "starry" ? "text-gray-200" : "text-memorial-700"
                      )}
                    >
                      {wrapper.name}
                    </div>
                    <div
                      className={cn(
                        "text-xs text-center mt-0.5",
                        theme === "starry" ? "text-gray-400" : "text-memorial-500"
                      )}
                    >
                      {wrapper.description}
                    </div>
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  "mt-4 p-4 rounded-xl",
                  WRAPPER_STYLES.find((w) => w.id === selectedWrapper)?.pattern || "bg-white/50"
                )}
              >
                <p
                  className={cn(
                    "text-sm text-center",
                    theme === "starry" ? "text-gray-300" : "text-memorial-700"
                  )}
                >
                  <Gift className="w-4 h-4 inline mr-1" />
                  花束预览：{getFlowerItemsDisplay(getSelectedItemsList())}
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p
                className={cn(
                  "text-sm",
                  theme === "starry" ? "text-gray-300" : "text-memorial-600"
                )}
              >
                写下你的寄语（选填）
              </p>

              <div
                className={cn(
                  "p-4 rounded-xl mb-4",
                  WRAPPER_STYLES.find((w) => w.id === selectedWrapper)?.pattern || "bg-white/50"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium mb-2",
                    theme === "starry" ? "text-gray-200" : "text-memorial-700"
                  )}
                >
                  花束详情
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedItemsList().map((item, idx) => {
                    const flower = FLOWER_TYPES.find((f) => f.id === item.type);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm",
                          theme === "starry" ? "bg-white/10" : "bg-white/70"
                        )}
                        title={flower?.meaning}
                      >
                        {flower?.emoji} {flower?.name} × {item.quantity}
                      </div>
                    );
                  })}
                </div>
                <p
                  className={cn(
                    "text-xs mt-3",
                    theme === "starry" ? "text-gray-400" : "text-memorial-500"
                  )}
                >
                  包装：{WRAPPER_STYLES.find((w) => w.id === selectedWrapper)?.name}
                </p>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="写下你想对逝者说的话..."
                rows={3}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all resize-none text-sm",
                  theme === "starry"
                    ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                    : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
                )}
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
                } else {
                  setShowSelector(false);
                  setSelectedItems({ chrysanthemum: 1 });
                  setSelectedWrapper("white");
                  setCurrentStep(1);
                }
              }}
              className={cn(
                "px-4 py-2 text-sm transition-colors",
                theme === "starry"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-memorial-500 hover:text-memorial-700"
              )}
            >
              {currentStep > 1 ? "上一步" : "取消"}
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl transition-colors text-sm font-medium",
                  totalFlowers === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : theme === "starry"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-memorial-700 hover:bg-memorial-600"
                )}
                disabled={totalFlowers === 0}
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleGiveFlower}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl transition-colors text-sm font-medium",
                  totalFlowers === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : theme === "starry"
                    ? "bg-purple-600 hover:bg-purple-500"
                    : "bg-memorial-700 hover:bg-memorial-600"
                )}
                disabled={totalFlowers === 0}
              >
                <Send className="w-4 h-4" />
                献上花束
              </button>
            )}
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
