import { useState, useEffect, useCallback, useMemo } from "react";
import { X, SkipForward, Pause, Play, ChevronRight, User } from "lucide-react";
import { RITUAL_STEPS, CHANTING_TEXTS } from "@/types";
import type { Memorial } from "@/types";
import { cn } from "@/lib/utils";

interface MemorialRitualProps {
  memorial: Memorial;
  onClose: () => void;
  onComplete?: (prayerMessage: string, offerings: string[]) => void;
}

const OFFERING_OPTIONS = [
  { id: "flower", emoji: "🌸", name: "鲜花" },
  { id: "fruit", emoji: "🍎", name: "鲜果" },
  { id: "pastry", emoji: "🍰", name: "糕点" },
  { id: "tea", emoji: "🍵", name: "清茶" },
  { id: "wine", emoji: "🍶", name: "美酒" },
  { id: "vegetable", emoji: "🥬", name: "时蔬" },
  { id: "rice", emoji: "🍚", name: "米饭" },
  { id: "candy", emoji: "🍬", name: "糖果" },
];

const BOW_COUNT = 3;

export default function MemorialRitual({ memorial, onClose, onComplete }: MemorialRitualProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stepProgress, setStepProgress] = useState(0);
  const [bowCount, setBowCount] = useState(0);
  const [bowAnimKey, setBowAnimKey] = useState(0);
  const [chantingIndex, setChantingIndex] = useState(-1);
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>([]);
  const [offeringShowIndex, setOfferingShowIndex] = useState(-1);
  const [prayerMessage, setPrayerMessage] = useState("");
  const [participant, setParticipant] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [stepContentKey, setStepContentKey] = useState(0);

  const currentStep = RITUAL_STEPS[currentStepIndex];
  const overallProgress = useMemo(() => {
    return ((currentStepIndex + (currentStep?.duration ? stepProgress / 100 : 0)) / RITUAL_STEPS.length) * 100;
  }, [currentStepIndex, stepProgress, currentStep]);

  const startStepTimer = useCallback(() => {
    const step = RITUAL_STEPS[currentStepIndex];
    if (!step || step.duration === 0) return;

    setStepProgress(0);
    const startTime = Date.now();
    const duration = step.duration;

    const tick = () => {
      if (!isPlaying) return;
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setStepProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [currentStepIndex, isPlaying]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < RITUAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setStepContentKey((k) => k + 1);
      setStepProgress(0);
      setBowCount(0);
      setChantingIndex(-1);
      setOfferingShowIndex(-1);
    } else if (currentStepIndex === RITUAL_STEPS.length - 1) {
      onComplete?.(prayerMessage, selectedOfferings);
    }
  }, [currentStepIndex, prayerMessage, selectedOfferings, onComplete]);

  const skipStep = () => {
    goToNextStep();
  };

  const toggleOffering = (id: string) => {
    setSelectedOfferings((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const canProceedFromPrayer = prayerMessage.trim().length > 0;

  useEffect(() => {
    if (showIntro) return;
    startStepTimer();
  }, [currentStepIndex, isPlaying, showIntro, startStepTimer]);

  useEffect(() => {
    if (stepProgress >= 100 && currentStep?.duration > 0) {
      if (currentStepIndex < RITUAL_STEPS.length - 1) {
        goToNextStep();
      }
    }
  }, [stepProgress, currentStepIndex, currentStep, goToNextStep]);

  useEffect(() => {
    if (currentStep?.id === "bow" && isPlaying && bowCount < BOW_COUNT) {
      const timing = currentStep.duration / BOW_COUNT;
      const interval = setInterval(() => {
        setBowCount((prev) => {
          if (prev < BOW_COUNT) {
            setBowAnimKey((k) => k + 1);
            return prev + 1;
          }
          return prev;
        });
      }, timing);
      return () => clearInterval(interval);
    }
  }, [currentStep, isPlaying, bowCount, currentStepIndex, stepContentKey]);

  useEffect(() => {
    if (currentStep?.id === "chanting" && isPlaying) {
      if (chantingIndex < 0) {
        setChantingIndex(0);
        return;
      }
      const durationPerLine = currentStep.duration / (CHANTING_TEXTS.length + 1);
      const timeout = setTimeout(() => {
        setChantingIndex((prev) => {
          if (prev < CHANTING_TEXTS.length - 1) return prev + 1;
          return prev;
        });
      }, durationPerLine);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, isPlaying, chantingIndex, stepContentKey]);

  useEffect(() => {
    if (currentStep?.id === "offering" && isPlaying) {
      if (offeringShowIndex < 0) {
        setOfferingShowIndex(0);
        return;
      }
      const totalShow = Math.min(selectedOfferings.length, 6);
      if (totalShow === 0) return;
      if (offeringShowIndex >= totalShow - 1) return;

      const durationPerItem = currentStep.duration / Math.max(totalShow, 1);
      const timeout = setTimeout(() => {
        setOfferingShowIndex((prev) => Math.min(prev + 1, totalShow - 1));
      }, durationPerItem);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, isPlaying, offeringShowIndex, selectedOfferings, stepContentKey]);

  const lotusPetals = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    }));
  }, []);

  if (showIntro) {
    return (
      <div className="ritual-overlay" onClick={onClose}>
        <div className="ritual-container">
          <div className="ritual-bg-ambient">
            <div className="ritual-light-ray" />
            {lotusPetals.map((p) => (
              <span
                key={p.id}
                className="ritual-lotus-petal"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              >
                🪷
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-6 right-6 z-20 p-3 rounded-full ritual-btn-secondary"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="flex-1 flex items-center justify-center p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ritual-main-card rounded-3xl p-8 md:p-12 max-w-xl w-full text-center animate-fade-in">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-6 ritual-portrait-frame p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-memorial-800">
                  {memorial.avatar ? (
                    <img
                      src={memorial.avatar}
                      alt={memorial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🌿</span>
                  )}
                </div>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-gold-200 mb-2">
                祭奠仪式
              </h2>
              <p className="font-serif text-xl md:text-2xl text-cream-100 mb-1">
                谨以此仪式 追思缅怀
              </p>
              <p className="font-serif text-3xl md:text-4xl text-gold-300 mb-6 font-medium">
                {memorial.name}
              </p>
              <div className="ritual-divider my-6" />
              <p className="text-cream-200/70 text-sm md:text-base leading-relaxed mb-8 font-serif">
                本仪式包含八个环节：净手静心、敬香三炷、三鞠躬礼、敬酒献茶、
                诵经祈福、敬献祭品、致祭文、礼成回向。
                <br />
                请怀着一颗虔诚恭敬之心，共同完成这场缅怀追思之旅。
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl ritual-btn-secondary">
                  <div className="w-10 h-10 rounded-full bg-memorial-800/50 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gold-300" />
                  </div>
                  <input
                    type="text"
                    value={participant}
                    onChange={(e) => setParticipant(e.target.value)}
                    placeholder="请输入您的称谓（可选，如：不孝子/不孝女/晚辈等）"
                    className="flex-1 bg-transparent outline-none text-cream-100 text-sm placeholder:text-cream-100/30"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowIntro(false);
                    setStepContentKey((k) => k + 1);
                  }}
                  className="w-full py-4 rounded-xl ritual-btn-primary font-medium text-base flex items-center justify-center gap-2"
                >
                  开始仪式
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-6 text-xs text-cream-100/30">
                整个仪式约需 1 分钟，可随时跳过或暂停
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStepVisual = () => {
    const key = stepContentKey;
    switch (currentStep.id) {
      case "purification":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">💧</span>
            </div>
            <div className="flex items-end gap-2 text-5xl">
              <span style={{ animation: `float 2.5s ease-in-out ${0}s infinite` }}>🫧</span>
              <span style={{ animation: `float 2.5s ease-in-out 0.3s infinite` }}>💧</span>
              <span style={{ animation: `float 2.5s ease-in-out 0.6s infinite` }}>✨</span>
            </div>
            <p className="mt-8 text-cream-200/60 text-sm font-serif tracking-wider">
              凝神静气 · 洗净凡尘
            </p>
          </div>
        );

      case "incense":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center relative">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">🕯️</span>
            </div>
            <div className="relative h-32 flex items-end justify-center gap-4 mt-4">
              <div
                className="ritual-incense-stick"
                style={{ transform: "rotate(-8deg)" }}
              />
              <div
                className="ritual-incense-stick"
                style={{ transform: "rotate(0deg)", height: "90px" }}
              />
              <div
                className="ritual-incense-stick"
                style={{ transform: "rotate(8deg)" }}
              />
              <div className="absolute -top-8 left-0 right-0 flex justify-center gap-10 pointer-events-none">
                <div className="ritual-incense-smoke" />
                <div className="ritual-incense-smoke" />
                <div className="ritual-incense-smoke" />
              </div>
            </div>
            <div className="mt-10 flex items-center justify-center gap-1 text-gold-400">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" style={{ animationDelay: "0.6s" }} />
            </div>
            <p className="mt-6 text-cream-200/60 text-sm font-serif tracking-wider">
              香氲袅袅 · 心意通达
            </p>
          </div>
        );

      case "bow":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">🙇</span>
            </div>
            <div className="relative h-36 flex items-end justify-center mt-2">
              <span
                key={bowAnimKey}
                className="ritual-bow-figure"
                style={{ animationIterationCount: BOW_COUNT }}
              >
                🙇
              </span>
            </div>
            <div className="mt-8 flex items-center gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-serif transition-all duration-500",
                    bowCount >= n
                      ? "bg-gold-400/20 border-2 border-gold-400 text-gold-300"
                      : "bg-cream-100/5 border border-cream-100/10 text-cream-100/30"
                  )}
                >
                  {bowCount >= n ? "✓" : n}
                </div>
              ))}
            </div>
            <p className="mt-6 text-gold-300/90 text-sm font-serif tracking-widest">
              {bowCount === 0 && "一鞠躬——"}
              {bowCount === 1 && "再鞠躬——"}
              {bowCount === 2 && "三鞠躬——"}
              {bowCount >= 3 && "礼毕"}
            </p>
          </div>
        );

      case "toast":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">🍶</span>
            </div>
            <div className="relative h-36 flex items-end justify-center mt-2">
              <span className="ritual-wine-cup" style={{ animationIterationCount: 2 }}>
                🍶
              </span>
            </div>
            <div className="mt-8 flex items-center gap-6 text-3xl">
              <span className="animate-float" style={{ animationDelay: "0s" }}>🍶</span>
              <span className="animate-float" style={{ animationDelay: "0.5s" }}>🍵</span>
              <span className="animate-float" style={{ animationDelay: "1s" }}>🥃</span>
            </div>
            <p className="mt-8 text-cream-200/60 text-sm font-serif tracking-wider">
              谨以清酌 · 敬献灵前
            </p>
          </div>
        );

      case "chanting":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">📿</span>
            </div>
            <div className="h-10 flex items-center justify-center mb-4">
              <span className="ritual-prayer-beads">📿</span>
            </div>
            <div className="w-full max-w-md space-y-2 mt-4 min-h-[160px]">
              {CHANTING_TEXTS.slice(0, chantingIndex + 1).map((text, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-center font-serif transition-all duration-700",
                    i === chantingIndex
                      ? "text-lg md:text-xl text-gold-200 ritual-chanting-line"
                      : "text-sm text-cream-100/40"
                  )}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {text}
                </p>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-1">
              {CHANTING_TEXTS.slice(0, Math.min(chantingIndex + 1, CHANTING_TEXTS.length)).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === chantingIndex
                      ? "bg-gold-400 w-4"
                      : "bg-gold-400/30"
                  )}
                />
              ))}
            </div>
          </div>
        );

      case "offering": {
        const displayOfferings = selectedOfferings.length > 0
          ? OFFERING_OPTIONS.filter((o) => selectedOfferings.includes(o.id))
          : OFFERING_OPTIONS.slice(0, 6);
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center w-full">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">🌸</span>
            </div>
            <div className="w-full max-w-md mb-6">
              <p className="text-xs text-cream-100/50 mb-3 font-serif">选择敬献的祭品（可多选）：</p>
              <div className="grid grid-cols-4 gap-2">
                {OFFERING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleOffering(opt.id)}
                    className={cn(
                      "ritual-offering-btn rounded-xl py-3 flex flex-col items-center gap-1",
                      selectedOfferings.includes(opt.id) && "selected"
                    )}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-[10px] text-cream-100/60">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-full max-w-md p-4 rounded-2xl bg-black/20 border border-gold-400/20">
              <p className="text-[10px] text-cream-100/40 text-center mb-3 font-serif tracking-wider">
                — 祭 品 台 —
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 min-h-[60px]">
                {displayOfferings.slice(0, offeringShowIndex + 1).map((opt, i) => (
                  <span
                    key={`${opt.id}-${i}`}
                    className="ritual-offering-item"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    {opt.emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "prayer":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center w-full">
            <div className="ritual-icon-container mb-6">
              <span className="ritual-icon-emoji">📜</span>
            </div>
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-xs text-cream-100/50 mb-2 font-serif tracking-wider">
                  致祭文 · 写下您想对{memorial.name}说的话
                </label>
                <textarea
                  value={prayerMessage}
                  onChange={(e) => setPrayerMessage(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-xl ritual-textarea resize-none font-serif text-base leading-relaxed"
                  placeholder={`${memorial.name}：\n\n在此倾诉您的思念、感恩与祝愿...\n\n愿此心意，上达天听。`}
                />
                <div className="mt-2 text-right text-xs text-cream-100/30">
                  {prayerMessage.length} 字
                </div>
              </div>
              <button
                onClick={skipStep}
                disabled={!canProceedFromPrayer}
                className="w-full py-4 rounded-xl ritual-btn-primary font-medium text-sm flex items-center justify-center gap-2"
              >
                焚化祭文 · 敬献心意
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case "completion":
        return (
          <div key={key} className="ritual-step-content-enter flex flex-col items-center">
            <div className="ritual-icon-container mb-6 ritual-completion-glow rounded-full">
              <span className="ritual-icon-emoji">🙏</span>
            </div>
            <div className="text-center space-y-3 mb-8">
              <p className="font-serif text-2xl text-gold-200 tracking-widest">
                仪 式 圆 满
              </p>
              <p className="font-serif text-lg text-gold-300/80">
                愿 以 此 功 德
              </p>
              <p className="font-serif text-lg text-gold-300/80">
                回 向 {memorial.name}
              </p>
              <div className="ritual-divider my-4 max-w-[200px] mx-auto" />
              <p className="text-cream-100/60 font-serif text-sm leading-relaxed">
                愿您离苦得乐，往生净土
                <br />
                早登极乐，福泽绵长
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-4xl mb-8">
              <span className="animate-float" style={{ animationDelay: "0s" }}>🪷</span>
              <span className="animate-float" style={{ animationDelay: "0.3s" }}>✨</span>
              <span className="animate-float" style={{ animationDelay: "0.6s" }}>🕊️</span>
              <span className="animate-float" style={{ animationDelay: "0.9s" }}>✨</span>
              <span className="animate-float" style={{ animationDelay: "1.2s" }}>🪷</span>
            </div>
            <button
              onClick={onClose}
              className="px-10 py-4 rounded-xl ritual-btn-primary font-medium text-base"
            >
              功德圆满
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ritual-overlay">
      <div className="ritual-container">
        <div className="ritual-bg-ambient">
          <div className="ritual-light-ray" />
          {currentStepIndex >= RITUAL_STEPS.length - 2 &&
            lotusPetals.map((p) => (
              <span
                key={p.id}
                className="ritual-lotus-petal"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              >
                🪷
              </span>
            ))}
        </div>

        <div className="relative z-10 px-4 md:px-8 pt-6 pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ritual-portrait-frame p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-memorial-800">
                    {memorial.avatar ? (
                      <img
                        src={memorial.avatar}
                        alt={memorial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">🌿</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-cream-100/80 font-serif text-sm">
                    追思 · {memorial.name}
                  </p>
                  <p className="text-gold-400/60 text-xs">
                    {participant ? `${participant} 敬祭` : "祭奠仪式进行中"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 rounded-full ritual-btn-secondary"
                  aria-label={isPlaying ? "暂停" : "继续"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                {currentStepIndex < RITUAL_STEPS.length - 1 && currentStep.id !== "prayer" && (
                  <button
                    onClick={skipStep}
                    className="p-2.5 rounded-full ritual-btn-secondary"
                    aria-label="跳过"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full ritual-btn-secondary"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="ritual-step-indicator pb-4">
              <div className="ritual-progress-track" />
              <div
                className="ritual-progress-fill"
                style={{ width: `${overallProgress}%` }}
              />
              <div className="flex justify-between relative">
                {RITUAL_STEPS.map((step, i) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "ritual-step-dot",
                        i === currentStepIndex && "active",
                        i < currentStepIndex && "completed"
                      )}
                    >
                      <span>{i + 1}</span>
                    </div>
                    <p
                      className={cn(
                        "ritual-step-label mt-2",
                        i === currentStepIndex && "active",
                        i < currentStepIndex && "completed"
                      )}
                    >
                      {step.title.slice(0, 2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-8 pb-6 relative z-10">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            <div className="text-center mb-6">
              <p className="text-gold-400/70 text-xs tracking-[0.3em] mb-1">
                {currentStep.subtitle}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl text-cream-100 mb-3">
                {currentStep.title}
              </h3>
              <p className="text-cream-100/60 text-sm md:text-base font-serif leading-relaxed max-w-lg mx-auto">
                {currentStep.description}
              </p>
            </div>

            {currentStep.duration > 0 && currentStep.id !== "prayer" && (
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="h-[3px] bg-cream-100/5 rounded-full overflow-hidden">
                  <div
                    className="ritual-timer-bar h-full"
                    style={{
                      width: `${stepProgress}%`,
                      transitionDuration: isPlaying ? "50ms" : "0ms",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-cream-100/30">
                  <span>
                    {currentStepIndex + 1} / {RITUAL_STEPS.length}
                  </span>
                  <span className="ritual-countdown-text font-medium">
                    {Math.max(0, Math.ceil(((100 - stepProgress) / 100) * (currentStep.duration / 1000)))}s
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 flex items-start justify-center py-2">
              {renderStepVisual()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
