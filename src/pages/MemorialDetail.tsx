import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Settings,
} from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import {
  formatDate,
  calculateAge,
  daysUntilDeathAnniversary,
  verifyPassword,
} from "@/utils";
import PhotoGallery from "@/components/PhotoGallery";
import MessageWall from "@/components/MessageWall";
import FlowerArea from "@/components/FlowerArea";
import CandleArea from "@/components/CandleArea";
import QRCodeCard from "@/components/QRCodeCard";
import PasswordProtected from "@/components/PasswordProtected";

export default function MemorialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMemorial, addMessage, addFlower, addCandle, loadMemorials, deleteMemorial } =
    useMemorialStore();

  const [isVerified, setIsVerified] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  const memorial = id ? getMemorial(id) : undefined;

  useEffect(() => {
    if (memorial && !memorial.isPrivate) {
      setIsVerified(true);
    }
  }, [memorial]);

  if (!memorial) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-20">
        <div className="text-center">
          <p className="text-memorial-500 mb-4">纪念页不存在</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-memorial-700 hover:text-memorial-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (memorial.isPrivate && !isVerified) {
    return (
      <PasswordProtected
        onVerify={() => setIsVerified(true)}
        verifyPassword={async (password) => {
          return await verifyPassword(password, memorial.password);
        }}
      />
    );
  }

  const age = calculateAge(memorial.birthDate, memorial.deathDate);
  const daysUntil = daysUntilDeathAnniversary(memorial.deathDate);
  const fullUrl = `${window.location.origin}${window.location.pathname}`;

  const handleDelete = () => {
    if (id) {
      deleteMemorial(id);
      navigate("/");
    }
  };

  const handleEditClick = () => {
    const password = prompt("请输入管理密码以编辑：");
    if (password === null) return;
    verifyPassword(password, memorial.password).then((isValid) => {
      if (isValid || !memorial.isPrivate) {
        navigate(`/edit/${id}`);
      } else {
        alert("密码错误");
      }
    });
  };

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="sticky top-16 md:top-20 z-30 bg-cream-100/80 backdrop-blur-md border-b border-memorial-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-memorial-600 hover:text-memorial-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">返回</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 rounded-full hover:bg-memorial-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-memorial-600" />
            </button>

            {showAdminMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-memorial-100 py-2 min-w-[140px] z-50">
                <button
                  onClick={handleEditClick}
                  className="w-full px-4 py-2 text-left text-sm text-memorial-700 hover:bg-memorial-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowAdminMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="relative py-12 md:py-20 bg-gradient-to-b from-memorial-950/5 to-cream-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-lg bg-memorial-100">
              {memorial.avatar ? (
                <img
                  src={memorial.avatar}
                  alt={memorial.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-memorial-400 text-5xl">
                  🌿
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-memorial-950 font-medium mb-3">
              {memorial.name}
            </h1>

            <div className="flex items-center justify-center gap-4 text-memorial-600 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(memorial.birthDate)} — {formatDate(memorial.deathDate)}
              </span>
              <span className="text-memorial-300">|</span>
              <span>享年 {age} 岁</span>
            </div>

            {memorial.epitaph && (
              <p className="font-serif text-lg text-memorial-700 italic mt-4">
                "{memorial.epitaph}"
              </p>
            )}

            {memorial.reminderEnabled && (
              <div className="mt-6 inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-2 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                距离忌日还有 {daysUntil} 天
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {memorial.biography && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-serif text-xl text-memorial-950 mb-4">
                      📖 生平介绍
                    </h3>
                    <div className="prose prose-memorial max-w-none">
                      <p className="text-memorial-700 leading-relaxed whitespace-pre-wrap font-serif text-base">
                        {memorial.biography}
                      </p>
                    </div>
                  </div>
                )}

                <PhotoGallery photos={memorial.photos} />
                <MessageWall
                  messages={memorial.messages}
                  onAddMessage={(author, content) => {
                    if (id) addMessage(id, { author, content });
                  }}
                />
              </div>

              <div className="space-y-6">
                <FlowerArea
                  flowers={memorial.flowers}
                  onAddFlower={(type, message) => {
                    if (id) addFlower(id, { type, message });
                  }}
                />
                <CandleArea
                  candles={memorial.candles}
                  onAddCandle={(message) => {
                    if (id) addCandle(id, { message });
                  }}
                />
                <QRCodeCard url={fullUrl} name={memorial.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="font-serif text-xl text-memorial-950 mb-2">
              确认删除
            </h3>
            <p className="text-memorial-600 mb-6 text-sm">
              删除后将无法恢复，确定要删除这个纪念页吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-memorial-200 text-memorial-700 rounded-xl hover:bg-memorial-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
