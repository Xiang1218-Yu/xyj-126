import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Settings,
  QrCode,
  Users,
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
  const { getMemorial, addMessage, addFlower, addCandle, loadMemorials, deleteMemorial, loadFamilyRelations, getRelationsForMemorial } =
    useMemorialStore();

  const [isVerified, setIsVerified] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"edit" | "delete">("edit");

  useEffect(() => {
    loadMemorials();
    loadFamilyRelations();
  }, [loadMemorials, loadFamilyRelations]);

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

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    if (!memorial.adminPassword && !memorial.password) {
      return true;
    }
    if (memorial.adminPassword) {
      return await verifyPassword(password, memorial.adminPassword);
    }
    if (memorial.isPrivate && memorial.password) {
      return await verifyPassword(password, memorial.password);
    }
    return false;
  };

  const handleAdminAction = (action: "edit" | "delete") => {
    setShowAdminMenu(false);
    setPasswordAction(action);

    if (!memorial.adminPassword && !memorial.password) {
      if (action === "edit") {
        navigate(`/edit/${id}`);
      } else {
        setShowDeleteConfirm(true);
      }
      return;
    }

    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    const isValid = await verifyAdminPassword(password);
    if (isValid) {
      setShowPasswordModal(false);
      if (passwordAction === "edit") {
        navigate(`/edit/${id}`);
      } else if (passwordAction === "delete") {
        setShowDeleteConfirm(true);
      }
    } else {
      alert("密码错误");
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteMemorial(id);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="sticky top-16 md:top-20 z-30 bg-cream-50/90 backdrop-blur-md border-b border-memorial-100">
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
                  onClick={() => handleAdminAction("edit")}
                  className="w-full px-4 py-2 text-left text-sm text-memorial-700 hover:bg-memorial-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => handleAdminAction("delete")}
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

      <section className="relative py-12 md:py-16 bg-gradient-to-b from-memorial-950/5 to-cream-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full mx-auto mb-5 overflow-hidden border-4 border-white shadow-lg bg-memorial-100">
              {memorial.avatar ? (
                <img
                  src={memorial.avatar}
                  alt={memorial.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-memorial-400 text-4xl">
                  🌿
                </div>
              )}
            </div>

            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-memorial-950 font-medium mb-2">
              {memorial.name}
            </h1>

            <div className="flex items-center justify-center gap-3 text-memorial-600 text-sm md:text-base mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(memorial.birthDate)} — {formatDate(memorial.deathDate)}
              </span>
              <span className="text-memorial-300">|</span>
              <span>享年 {age} 岁</span>
            </div>

            {memorial.epitaph && (
              <p className="font-serif text-base md:text-lg text-memorial-700 italic mt-3">
                "{memorial.epitaph}"
              </p>
            )}

            {memorial.reminderEnabled && (
              <div className="mt-5 inline-flex items-center gap-2 bg-gold-100/80 text-gold-700 px-4 py-1.5 rounded-full text-xs md:text-sm">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                距离忌日还有 {daysUntil} 天
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
              <div className="lg:col-span-8 space-y-5 md:space-y-6">
                {memorial.biography && (
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
                    <h3 className="font-serif text-lg md:text-xl text-memorial-950 mb-4">
                      📖 生平介绍
                    </h3>
                    <div className="prose prose-memorial max-w-none">
                      <p className="text-memorial-700 leading-relaxed whitespace-pre-wrap font-serif text-sm md:text-base">
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

              <div className="lg:col-span-4 space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
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
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-serif text-lg text-memorial-950 mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    二维码铭牌
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 shrink-0 bg-white rounded-lg border border-memorial-100 flex items-center justify-center overflow-hidden">
                      <QRCodeCard url={fullUrl} name={memorial.name} compact />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-memorial-600 mb-3">
                        扫码查看{memorial.name}的纪念页
                      </p>
                      <button
                        onClick={() => {
                          const canvas = document.querySelector("#qr-code-canvas canvas");
                          if (canvas) {
                            const link = document.createElement("a");
                            link.download = `${memorial.name}-纪念页二维码.png`;
                            link.href = (canvas as HTMLCanvasElement).toDataURL("image/png");
                            link.click();
                          }
                        }}
                        className="text-sm text-memorial-700 hover:text-memorial-900 underline"
                      >
                        下载二维码
                      </button>
                    </div>
                  </div>
                </div>

                {id && getRelationsForMemorial(id).filter(({ otherMemorial }) => !otherMemorial.isPrivate).length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-serif text-lg text-memorial-950 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      亲属关系
                    </h3>
                    <div className="space-y-3">
                      {getRelationsForMemorial(id)
                        .filter(({ otherMemorial }) => !otherMemorial.isPrivate)
                        .map(({ otherMemorial, label }) => (
                          <Link
                            key={otherMemorial.id}
                            to={`/memorial/${otherMemorial.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-memorial-50 hover:bg-memorial-100 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full bg-memorial-200 flex items-center justify-center flex-shrink-0">
                              {otherMemorial.avatar ? (
                                <img
                                  src={otherMemorial.avatar}
                                  alt={otherMemorial.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="font-serif text-memorial-700 text-lg">
                                  {otherMemorial.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-memorial-800 truncate">
                                {otherMemorial.name}
                              </p>
                              <p className="text-sm text-memorial-500">{label}</p>
                            </div>
                          </Link>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-memorial-100">
                      <Link
                        to="/family-network"
                        className="inline-flex items-center gap-1 text-sm text-memorial-600 hover:text-memorial-800 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        查看完整亲属网络
                      </Link>
                    </div>
                  </div>
                )}
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

      {showPasswordModal && (
        <PasswordModal
          title={passwordAction === "edit" ? "编辑验证" : "删除验证"}
          description={`请输入管理密码以${passwordAction === "edit" ? "编辑" : "删除"}纪念页`}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}

function PasswordModal({
  title,
  description,
  onSubmit,
  onCancel,
}: {
  title: string;
  description: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in">
        <h3 className="font-serif text-xl text-memorial-950 mb-2">{title}</h3>
        <p className="text-memorial-600 mb-6 text-sm">{description}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入管理密码"
            className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-memorial-200 text-memorial-700 rounded-xl hover:bg-memorial-50 transition-colors text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-memorial-700 text-white rounded-xl hover:bg-memorial-600 transition-colors text-sm font-medium"
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
