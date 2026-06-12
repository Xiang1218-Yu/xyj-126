import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Image } from "lucide-react";
import type { Photo } from "@/types";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: Photo[];
  theme?: string;
}

export default function PhotoGallery({ photos, theme = "default" }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = "";
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === 0 ? photos.length - 1 : (prev ?? 0) - 1
    );
  };

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === photos.length - 1 ? 0 : (prev ?? 0) + 1
    );
  };

  if (photos.length === 0) {
    return (
      <div className="theme-card rounded-2xl p-6 shadow-sm">
        <h3
          className={cn(
            "font-serif text-xl mb-4",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          📷 相册
        </h3>
        <div
          className={cn(
            "text-center py-12",
            theme === "starry" ? "text-gray-500" : "text-memorial-400"
          )}
        >
          <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无照片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            "font-serif text-xl",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          📷 相册
        </h3>
        <span
          className={cn(
            "text-sm",
            theme === "starry" ? "text-gray-400" : "text-memorial-500"
          )}
        >
          {photos.length} 张照片
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
          >
            <img
              src={photo.url}
              alt={photo.caption || `照片 ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedIndex].url}
              alt={photos[selectedIndex].caption || ""}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {photos[selectedIndex].caption && (
              <p className="text-white/80 text-center mt-4 text-sm">
                {photos[selectedIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
