import { useRef, useState, useCallback } from "react";
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
        <img src={logoUrl} alt="Logo" className="qr-logo-img" />
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
  return (
    <div className={cn("nameplate-template", theme && `theme-${theme}`)}>
      <div className="nameplate-inner">
        <div className="nameplate-header">
          {avatar && (
            <div className="nameplate-avatar">
              <img src={avatar} alt={name} />
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
              size={shape === "classic" ? 200 : 160}
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const nameplateRef = useRef<HTMLDivElement>(null);
  const [selectedShape, setSelectedShape] = useState<QRCodeShape>("classic");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [showNameplate, setShowNameplate] = useState(false);
  const [showLogoInput, setShowLogoInput] = useState(false);
  const [logoInputValue, setLogoInputValue] = useState("");

  const downloadQRCode = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${name}-纪念页二维码-${selectedShape}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [name, selectedShape]);

  const downloadNameplate = useCallback(() => {
    const el = nameplateRef.current;
    if (!el) return;

    const canvas = document.createElement("canvas");
    const scale = 2;
    const w = 600;
    const h = 900;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    ctx.fillStyle = theme === "starry" ? "#0f1937" : "#faf7f0";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = theme === "starry" ? "#e8ecf5" : "#1a3a2f";
    ctx.font = "bold 28px serif";
    ctx.textAlign = "center";
    ctx.fillText(name, w / 2, 120);

    if (birthDate && deathDate) {
      ctx.fillStyle = theme === "starry" ? "#9ca8c8" : "#6f7e61";
      ctx.font = "16px sans-serif";
      ctx.fillText(`${birthDate} — ${deathDate}`, w / 2, 155);
    }

    if (epitaph) {
      ctx.fillStyle = theme === "starry" ? "#9ca8c8" : "#6f7e61";
      ctx.font = "italic 14px serif";
      ctx.fillText(`"${epitaph}"`, w / 2, 190);
    }

    ctx.fillStyle = theme === "starry" ? "#9ca8c8" : "#6f7e61";
    ctx.font = "12px sans-serif";
    ctx.fillText(`扫码查看${name}的纪念页`, w / 2, h - 80);

    ctx.fillStyle = theme === "starry" ? "#4a5a80" : "#d4d9cd";
    ctx.fillRect(w / 2 - 80, h - 50, 160, 1);

    ctx.fillStyle = theme === "starry" ? "#6a7a9a" : "#8f9c82";
    ctx.font = "10px serif";
    ctx.fillText("永恒纪念", w / 2, h - 30);

    const qrCanvas = canvasRef.current?.querySelector("canvas");
    if (qrCanvas) {
      const qrSize = 200;
      ctx.drawImage(qrCanvas, (w - qrSize) / 2, 230, qrSize, qrSize);
    }

    const link = document.createElement("a");
    link.download = `${name}-铭牌.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [name, epitaph, birthDate, deathDate, theme]);

  const printNameplate = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const nameplateHTML = nameplateRef.current?.innerHTML || "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${name}-铭牌</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          @media print {
            body { margin: 0; }
            @page { size: A4; margin: 15mm; }
          }
          .nameplate-template {
            width: 600px;
            padding: 40px;
            background: ${theme === "starry" ? "#0f1937" : "#faf7f0"};
            border-radius: 16px;
          }
          .nameplate-inner {
            border: 2px solid ${theme === "starry" ? "#3a4a70" : "#d4d9cd"};
            border-radius: 12px;
            padding: 32px;
            text-align: center;
          }
          .nameplate-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 20px;
          }
          .nameplate-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid ${theme === "starry" ? "#3a4a70" : "#d4d9cd"};
          }
          .nameplate-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .nameplate-name {
            font-family: 'Noto Serif SC', serif;
            font-size: 28px;
            font-weight: 600;
            color: ${theme === "starry" ? "#e8ecf5" : "#1a3a2f"};
          }
          .nameplate-dates {
            font-size: 14px;
            color: ${theme === "starry" ? "#9ca8c8" : "#6f7e61"};
            margin-top: 4px;
          }
          .nameplate-epitaph {
            font-family: 'Noto Serif SC', serif;
            font-style: italic;
            font-size: 14px;
            color: ${theme === "starry" ? "#9ca8c8" : "#6f7e61"};
            margin-bottom: 24px;
          }
          .nameplate-qr-area {
            display: flex;
            justify-content: center;
            margin: 24px 0;
          }
          .nameplate-scan-hint {
            font-size: 12px;
            color: ${theme === "starry" ? "#9ca8c8" : "#6f7e61"};
            margin-top: 12px;
          }
          .nameplate-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 20px;
          }
          .nameplate-footer-line {
            width: 80px;
            height: 1px;
            background: ${theme === "starry" ? "#3a4a70" : "#d4d9cd"};
          }
          .nameplate-footer-text {
            font-family: 'Noto Serif SC', serif;
            font-size: 10px;
            color: ${theme === "starry" ? "#6a7a9a" : "#8f9c82"};
          }
        </style>
      </head>
      <body>
        ${nameplateHTML}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
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
        // share cancelled
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

  if (compact) {
    return (
      <div ref={canvasRef} id="qr-code-canvas" className="w-full h-full flex items-center justify-center">
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
            ref={canvasRef}
            className={cn(
              "mb-4 flex items-center justify-center",
              selectedShape === "classic" && "p-4 bg-white rounded-xl border border-memorial-100"
            )}
          >
            <ShapeFrame shape={selectedShape} className="qr-shape-container">
              <QRCodeCanvas
                value={url}
                size={selectedShape === "classic" ? 180 : 140}
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

      <div className="hidden">
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
    </>
  );
}
