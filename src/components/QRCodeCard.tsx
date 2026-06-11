import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, QrCode } from "lucide-react";

interface QRCodeCardProps {
  url: string;
  name: string;
}

export default function QRCodeCard({ url, name }: QRCodeCardProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${name}-纪念页二维码.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareURL = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}的纪念页`,
          text: `来看看${name}的纪念页`,
          url: url,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("链接已复制到剪贴板");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-serif text-xl text-memorial-950 mb-4">
        <QrCode className="w-5 h-5 inline mr-2 text-memorial-500" />
        二维码铭牌
      </h3>

      <div className="flex flex-col items-center">
        <div
          ref={canvasRef}
          className="p-4 bg-white rounded-xl border border-memorial-100 mb-4"
        >
          <QRCodeCanvas
            value={url}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#1a3a2f"
            bgColor="#ffffff"
          />
        </div>

        <p className="text-sm text-memorial-500 mb-4 text-center">
          扫码查看{name}的纪念页
        </p>

        <div className="flex gap-2 w-full">
          <button
            onClick={downloadQRCode}
            className="flex-1 flex items-center justify-center gap-2 border border-memorial-200 text-memorial-700 py-2.5 rounded-xl hover:bg-memorial-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            下载
          </button>
          <button
            onClick={shareURL}
            className="flex-1 flex items-center justify-center gap-2 bg-memorial-700 text-white py-2.5 rounded-xl hover:bg-memorial-600 transition-colors text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      </div>
    </div>
  );
}
