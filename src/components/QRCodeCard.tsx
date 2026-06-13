import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, QrCode, Printer, ImagePlus, X } from "lucide-react";
import { QR_CODE_STYLES, type QRCodeShape } from "@/types";
import { cn } from "@/lib/utils";

interface QRCodeCardProps {
  url: string;
  name: string;
  compact?: boolean;
  epitaph?: string;
  birthDate?: string;
  deathDate?: string;
  avatar?: string;
  theme?: string;
}

const QR_SIZES: Record<QRCodeShape, number> = {
  classic: 180,
  tombstone: 120,
  heart: 100,
  petal: 110,
};

function ShapeFrame({
  shape,
  children,
  className,
}: {
  shape: QRCodeShape;
  children: React.ReactNode;
  className?: string;
}) {
  if (shape === "classic") {
    return (
      <div className={cn("qr-shape-classic", className)}>
        {children}
      </div>
    );
  }

  if (shape === "tombstone") {
    return (
      <div className={cn("qr-shape-tombstone", className)}>
        <svg
          className="qr-shape-tombstone-border"
          viewBox="0 0 220 300"
          preserveAspectRatio="none"
        >
          <path
            d="M10,300 L10,80 Q10,10 110,10 Q210,10 210,80 L210,300 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <div className="qr-shape-tombstone-inner">{children}</div>
      </div>
    );
  }

  if (shape === "heart") {
    return (
      <div className={cn("qr-shape-heart", className)}>
        <svg
          className="qr-shape-heart-border"
          viewBox="0 0 220 210"
          preserveAspectRatio="none"
        >
          <path
            d="M110,190 Q10,120 10,60 Q10,10 60,10 Q110,10 110,60 Q110,10 160,10 Q210,10 210,60 Q210,120 110,190 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <div className="qr-shape-heart-inner">{children}</div>
      </div>
    );
  }

  if (shape === "petal") {
    return (
      <div className={cn("qr-shape-petal", className)}>
        <svg
          className="qr-shape-petal-border"
          viewBox="0 0 220 220"
          preserveAspectRatio="none"
        >
          <path
            d="M110,10 Q160,30 190,80 Q210,130 190,180 Q160,210 110,210 Q60,210 30,180 Q10,130 30,80 Q60,30 110,10 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <div className="qr-shape-petal-inner">{children}</div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

function LogoOverlay({ logoUrl }: { logoUrl?: string }) {
  if (!logoUrl) return null;
  return (
    <div className="qr-logo-overlay">
      <div className="qr-logo-bg">
        <img
          src={logoUrl}
          alt="Logo"
          crossOrigin="anonymous"
          style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 4, display: "block" }}
        />
      </div>
    </div>
  );
}

function NameplateTemplate({
  url,
  name,
  epitaph,
  birthDate,
  deathDate,
  avatar,
  shape,
  logoUrl,
  theme,
}: {
  url: string;
  name: string;
  epitaph?: string;
  birthDate?: string;
  deathDate?: string;
  avatar?: string;
  shape: QRCodeShape;
  logoUrl?: string;
  theme?: string;
}) {
  const qrSize = shape === "classic" ? 200 : QR_SIZES[shape];

  return (
    <div className={cn("nameplate-template", theme && `theme-${theme}`)}>
      <div className="nameplate-inner">
        <div className="nameplate-header">
          {avatar && (
            <div className="nameplate-avatar">
              <img src={avatar} alt={name} crossOrigin="anonymous" />
            </div>
          )}
          <div className="nameplate-title">
            <h1 className="nameplate-name font-serif">{name}</h1>
            {birthDate && deathDate && (
              <p className="nameplate-dates">
                {birthDate} — {deathDate}
              </p>
            )}
          </div>
        </div>

        {epitaph && (
          <p className="nameplate-epitaph font-serif">"{epitaph}"</p>
        )}

        <div className="nameplate-qr-area">
          <ShapeFrame shape={shape} className="nameplate-qr-frame">
            <QRCodeCanvas
              value={url}
              size={qrSize}
              level="H"
              includeMargin={false}
              fgColor={theme === "starry" ? "#e8ecf5" : "#1a3a2f"}
              bgColor={theme === "starry" ? "#1a2547" : "#ffffff"}
            />
            <LogoOverlay logoUrl={logoUrl} />
          </ShapeFrame>
        </div>

        <p className="nameplate-scan-hint">扫码查看{name}的纪念页</p>

        <div className="nameplate-footer">
          <span className="nameplate-footer-line" />
          <span className="nameplate-footer-text font-serif">永恒纪念</span>
          <span className="nameplate-footer-line" />
        </div>
      </div>
    </div>
  );
}

async function captureElement(el: HTMLElement, filename: string) {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    logging: false,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function QRCodeCard({
  url,
  name,
  compact = false,
  epitaph,
  birthDate,
  deathDate,
  avatar,
  theme = "default",
}: QRCodeCardProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const nameplateRef = useRef<HTMLDivElement>(null);
  const [selectedShape, setSelectedShape] = useState<QRCodeShape>("classic");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [showNameplate, setShowNameplate] = useState(false);
  const [showLogoInput, setShowLogoInput] = useState(false);
  const [logoInputValue, setLogoInputValue] = useState("");

  const downloadQRCode = useCallback(async () => {
    const el = exportRef.current;
    if (!el) return;
    await captureElement(el, `${name}-纪念页二维码-${selectedShape}.png`);
  }, [name, selectedShape]);

  const downloadNameplate = useCallback(async () => {
    const el = nameplateRef.current;
    if (!el) return;
    await captureElement(el, `${name}-铭牌.png`);
  }, [name]);

  const printNameplate = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const nameplateHTML = nameplateRef.current?.innerHTML || "";

    const themeBg = theme === "starry" ? "#0f1937"
      : theme === "sakura" ? "#fff5f7"
      : theme === "autumn" ? "#fff8e7"
      : theme === "snow" ? "#f0f7ff"
      : "#faf7f0";
    const themeBorder = theme === "starry" ? "#3a4a70"
      : theme === "sakura" ? "#ffc8d8"
      : theme === "autumn" ? "#e8c99b"
      : theme === "snow" ? "#d0e0f0"
      : "#d4d9cd";
    const themeText = theme === "starry" ? "#e8ecf5" : "#1a3a2f";
    const themeSub = theme === "starry" ? "#9ca8c8" : "#6f7e61";
    const themeMuted = theme === "starry" ? "#6a7a9a" : "#8f9c82";
    const themeLine = theme === "starry" ? "#3a4a70" : "#d4d9cd";

    printWindow.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${name}-铭牌</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5}
@media print{body{margin:0;background:#fff}@page{size:A4;margin:15mm}}
.nameplate-template{width:600px;padding:40px;background:${themeBg};border-radius:16px}
.nameplate-inner{border:2px solid ${themeBorder};border-radius:12px;padding:32px;text-align:center}
.nameplate-header{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px}
.nameplate-avatar{width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid ${themeBorder};flex-shrink:0}
.nameplate-avatar img{width:100%;height:100%;object-fit:cover}
.nameplate-name{font-family:'Noto Serif SC',serif;font-size:28px;font-weight:600;color:${themeText}}
.nameplate-dates{font-size:14px;color:${themeSub};margin-top:4px}
.nameplate-epitaph{font-family:'Noto Serif SC',serif;font-style:italic;font-size:14px;color:${themeSub};margin-bottom:24px}
.nameplate-qr-area{display:flex;justify-content:center;margin:24px 0}
.qr-shape-tombstone{position:relative;display:inline-flex;align-items:center;justify-content:center;width:160px;height:210px;background:linear-gradient(180deg,#f8f6f0,#e8e4d8);border-radius:80px 80px 8px 8px;padding:20px 10px;color:#8f9c82}
.qr-shape-heart{position:relative;display:inline-flex;align-items:center;justify-content:center;width:180px;height:170px;background:linear-gradient(180deg,#fff5f7,#ffe4ec);clip-path:path('M90,160 Q5,100 5,52 Q5,8 49,8 Q90,8 90,44 Q90,8 131,8 Q175,8 175,52 Q175,100 90,160 Z');padding:20px;color:#e8a0b0}
.qr-shape-petal{position:relative;display:inline-flex;align-items:center;justify-content:center;width:160px;height:160px;background:linear-gradient(135deg,#fef3e2,#fce4d6 30%,#f5d0e0 70%,#e8d0f0);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;padding:20px;color:#d4a0c0}
.qr-logo-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;pointer-events:none}
.qr-logo-bg{width:40px;height:40px;border-radius:8px;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.12);border:2px solid white}
.qr-logo-bg img{width:28px;height:28px;object-fit:contain;border-radius:4px}
.nameplate-scan-hint{font-size:12px;color:${themeSub};margin-top:12px}
.nameplate-footer{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:20px}
.nameplate-footer-line{width:80px;height:1px;background:${themeLine}}
.nameplate-footer-text{font-family:'Noto Serif SC',serif;font-size:10px;color:${themeMuted}}
</style></head><body>
${nameplateHTML}
<script>window.onload=function(){window.print()}</script>
</body></html>`);
    printWindow.document.close();
  }, [name, theme]);

  const shareURL = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}的纪念页`,
          text: `来看看${name}的纪念页`,
          url: url,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("链接已复制到剪贴板");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoUrl(result);
      setLogoInputValue(result);
    };
    reader.readAsDataURL(file);
  };

  const applyLogoUrl = () => {
    if (logoInputValue.trim()) {
      setLogoUrl(logoInputValue.trim());
    } else {
      setLogoUrl("");
    }
    setShowLogoInput(false);
  };

  const qrSize = QR_SIZES[selectedShape];

  if (compact) {
    return (
      <div id="qr-code-canvas" className="w-full h-full flex items-center justify-center">
        <QRCodeCanvas
          value={url}
          size={80}
          level="M"
          includeMargin={false}
          fgColor="#1a3a2f"
          bgColor="#ffffff"
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-xl text-memorial-950 mb-4">
          <QrCode className="w-5 h-5 inline mr-2 text-memorial-500" />
          二维码铭牌
        </h3>

        <div className="mb-4">
          <p className="text-xs text-memorial-500 mb-2">选择样式</p>
          <div className="grid grid-cols-4 gap-2">
            {QR_CODE_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedShape(style.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs",
                  selectedShape === style.id
                    ? "border-memorial-500 bg-memorial-50 text-memorial-700 ring-1 ring-memorial-500/30"
                    : "border-memorial-100 text-memorial-500 hover:border-memorial-300 hover:bg-memorial-50"
                )}
                title={style.description}
              >
                <span className="text-lg">{style.icon}</span>
                <span className="font-medium">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            ref={exportRef}
            className={cn(
              "mb-4 flex items-center justify-center",
              selectedShape === "classic" && "p-4 bg-white rounded-xl border border-memorial-100"
            )}
          >
            <ShapeFrame shape={selectedShape} className="qr-shape-container">
              <QRCodeCanvas
                value={url}
                size={qrSize}
                level="H"
                includeMargin={false}
                fgColor="#1a3a2f"
                bgColor="#ffffff"
              />
              <LogoOverlay logoUrl={logoUrl} />
            </ShapeFrame>
          </div>

          <p className="text-sm text-memorial-500 mb-3 text-center">
            扫码查看{name}的纪念页
          </p>

          <div className="flex gap-2 w-full mb-3">
            <button
              onClick={downloadQRCode}
              className="flex-1 flex items-center justify-center gap-1.5 border border-memorial-200 text-memorial-700 py-2 rounded-xl hover:bg-memorial-50 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={shareURL}
              className="flex-1 flex items-center justify-center gap-1.5 bg-memorial-700 text-white py-2 rounded-xl hover:bg-memorial-600 transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>

          <div className="flex gap-2 w-full mb-3">
            <button
              onClick={() => setShowLogoInput(!showLogoInput)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 border py-2 rounded-xl transition-colors text-sm font-medium",
                logoUrl
                  ? "border-memorial-500 bg-memorial-50 text-memorial-700"
                  : "border-memorial-200 text-memorial-500 hover:border-memorial-300 hover:text-memorial-700"
              )}
            >
              <ImagePlus className="w-4 h-4" />
              {logoUrl ? "已添加Logo" : "添加Logo"}
            </button>
            {logoUrl && (
              <button
                onClick={() => {
                  setLogoUrl("");
                  setLogoInputValue("");
                }}
                className="flex items-center justify-center gap-1 border border-red-200 text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm"
                title="移除Logo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showLogoInput && (
            <div className="w-full mb-3 p-3 bg-memorial-50 rounded-xl space-y-2">
              <p className="text-xs text-memorial-500">上传或输入Logo地址</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-memorial-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-memorial-100 file:text-memorial-700 hover:file:bg-memorial-200"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoInputValue}
                  onChange={(e) => setLogoInputValue(e.target.value)}
                  placeholder="输入图片URL..."
                  className="flex-1 px-3 py-1.5 text-xs border border-memorial-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-memorial-400"
                />
                <button
                  onClick={applyLogoUrl}
                  className="px-3 py-1.5 text-xs bg-memorial-700 text-white rounded-lg hover:bg-memorial-600"
                >
                  应用
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowNameplate(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-memorial-200 text-memorial-700 py-2 rounded-xl hover:bg-memorial-50 transition-colors text-sm font-medium"
            >
              <QrCode className="w-4 h-4" />
              铭牌模板
            </button>
            <button
              onClick={printNameplate}
              className="flex-1 flex items-center justify-center gap-1.5 bg-memorial-950 text-cream-100 py-2 rounded-xl hover:bg-memorial-800 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              打印铭牌
            </button>
          </div>
        </div>
      </div>

      {showNameplate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-memorial-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-serif text-lg text-memorial-950">铭牌预览</h3>
              <button
                onClick={() => setShowNameplate(false)}
                className="p-1 rounded-full hover:bg-memorial-100 transition-colors"
              >
                <X className="w-5 h-5 text-memorial-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-4">
                {QR_CODE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedShape(style.id)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs",
                      selectedShape === style.id
                        ? "border-memorial-500 bg-memorial-50 ring-1 ring-memorial-500/30"
                        : "border-memorial-100 hover:border-memorial-300"
                    )}
                  >
                    <span className="text-base">{style.icon}</span>
                    <span className="text-memorial-600">{style.name}</span>
                  </button>
                ))}
              </div>

              <div ref={nameplateRef}>
                <NameplateTemplate
                  url={url}
                  name={name}
                  epitaph={epitaph}
                  birthDate={birthDate}
                  deathDate={deathDate}
                  avatar={avatar}
                  shape={selectedShape}
                  logoUrl={logoUrl}
                  theme={theme}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={downloadNameplate}
                  className="flex-1 flex items-center justify-center gap-2 bg-memorial-700 text-white py-2.5 rounded-xl hover:bg-memorial-600 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  下载铭牌
                </button>
                <button
                  onClick={printNameplate}
                  className="flex-1 flex items-center justify-center gap-2 border border-memorial-200 text-memorial-700 py-2.5 rounded-xl hover:bg-memorial-50 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  打印
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
