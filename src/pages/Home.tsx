import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Lock, Flower2 } from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { formatDateShort } from "@/utils";
import type { Memorial } from "@/types";

function MemorialCard({ memorial, index }: { memorial: Memorial; index: number }) {
  const isPrivate = memorial.isPrivate;

  return (
    <Link
      to={`/memorial/${memorial.id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-memorial transition-all duration-500 overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
    >
      <div className="relative h-48 bg-gradient-to-br from-memorial-100 to-memorial-200 overflow-hidden">
        {memorial.avatar && !isPrivate ? (
          <img
            src={memorial.avatar}
            alt={memorial.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : isPrivate ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-memorial-800/90">
            <Lock className="w-12 h-12 text-cream-200 mb-2" />
            <span className="text-cream-200 text-sm">已加密</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flower2 className="w-16 h-16 text-memorial-400" />
          </div>
        )}
        {isPrivate && (
          <div className="absolute top-3 right-3 bg-memorial-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            私密纪念
          </div>
        )}
        {!isPrivate && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-serif text-xl font-medium ${isPrivate ? "text-memorial-500" : "text-memorial-950"}`}>
            {isPrivate ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-memorial-300 rounded-full" />
                私密纪念页
              </span>
            ) : (
              memorial.name
            )}
          </h3>
        </div>
        {isPrivate ? (
          <p className="text-sm text-memorial-400 mb-3">
            输入密码后查看详情
          </p>
        ) : (
          <>
            <p className="text-sm text-memorial-500 mb-3">
              {formatDateShort(memorial.birthDate)} — {formatDateShort(memorial.deathDate)}
            </p>
            {memorial.epitaph && (
              <p className="text-sm text-memorial-600 line-clamp-2 font-serif italic">
                "{memorial.epitaph}"
              </p>
            )}
          </>
        )}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-memorial-100">
          <span className="text-xs text-memorial-400">
            💐 {isPrivate ? "?" : memorial.flowers.length} 献花
          </span>
          <span className="text-xs text-memorial-400">
            🕯️ {isPrivate ? "?" : memorial.candles.length} 蜡烛
          </span>
          <span className="text-xs text-memorial-400">
            💬 {isPrivate ? "?" : memorial.messages.length} 留言
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { memorials, loadMemorials, searchMemorials, isLoaded } = useMemorialStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  const displayMemorials = searchQuery ? searchMemorials(searchQuery) : memorials;

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-memorial-950/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-memorial-100 text-memorial-700 px-4 py-2 rounded-full text-sm mb-6 animate-fade-in">
              <Flower2 className="w-4 h-4" />
              让思念有处安放
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-memorial-950 font-medium mb-6 animate-slide-up">
              永恒的数字纪念堂
            </h1>
            <p className="text-lg text-memorial-600 mb-8 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              为逝去的亲人创建专属纪念页，记录生平、珍藏回忆、虚拟献花
              <br />
              让爱与思念在数字世界中永存
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 bg-memorial-950 text-cream-100 px-8 py-4 rounded-xl hover:bg-memorial-800 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                创建纪念页
              </Link>
              <a
                href="#memorials"
                className="inline-flex items-center justify-center gap-2 border border-memorial-300 text-memorial-700 px-8 py-4 rounded-xl hover:bg-memorial-50 transition-colors"
              >
                浏览纪念堂
              </a>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-cream-100 to-transparent pointer-events-none" />
      </section>

      <section id="memorials" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-memorial-950 font-medium">
                纪念堂
              </h2>
              <p className="text-memorial-500 mt-1">
                共 {memorials.length} 位逝者在此安息
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-memorial-400" />
              <input
                type="text"
                placeholder="搜索逝者姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 pl-10 pr-4 py-3 bg-white border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
              />
            </div>
          </div>

          {!isLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-memorial-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-memorial-100 rounded w-1/2" />
                    <div className="h-4 bg-memorial-100 rounded w-3/4" />
                    <div className="h-4 bg-memorial-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayMemorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayMemorials.map((memorial, index) => (
                <MemorialCard key={memorial.id} memorial={memorial} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-2xl">
              <Flower2 className="w-16 h-16 text-memorial-300 mx-auto mb-4" />
              <p className="text-memorial-500 mb-2">
                {searchQuery ? "没有找到匹配的纪念页" : "暂无公开纪念页"}
              </p>
              <p className="text-memorial-400 text-sm">
                {searchQuery ? "试试其他关键词" : "创建第一个纪念页，让思念有处安放"}
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="py-8 border-t border-memorial-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-memorial-400">
            永念 · 让爱与思念永存
          </p>
        </div>
      </footer>
    </div>
  );
}
