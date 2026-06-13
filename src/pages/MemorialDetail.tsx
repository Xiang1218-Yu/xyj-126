import { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  UserPlus,
  Pencil,
} from "lucide-react";
import CollaboratePanel from "@/components/CollaboratePanel";
import MemorialRitual from "@/components/MemorialRitual";
import DriftBottleArea from "@/components/DriftBottleArea";
import { useMemorialStore } from "@/store/memorialStore";
import {
  formatDate,
  calculateAge,
  daysUntilDeathAnniversary,
  verifyPassword,
  parseBiographyToTimeline,
} from "@/utils";
import PhotoGallery from "@/components/PhotoGallery";
import MessageWall from "@/components/MessageWall";
import FlowerArea from "@/components/FlowerArea";
import CandleArea from "@/components/CandleArea";
import QRCodeCard from "@/components/QRCodeCard";
import PasswordProtected from "@/components/PasswordProtected";
import ThemeSelector from "@/components/ThemeSelector";
import BiographyTimeline from "@/components/BiographyTimeline";
import WordCloud from "@/components/WordCloud";
import FestivalDecorations from "@/components/FestivalDecorations";
import { cn } from "@/lib/utils";

export default function MemorialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMemorial, addMessage, addFlower, addCandle, loadMemorials, deleteMemorial, loadFamilyRelations, getRelationsForMemorial, getCollaborators, currentCollaboratorId, getContributions, loadDriftBottles, getDriftBottlesForMemorial, sendDriftBottle, markDriftBottleRead } =
    useMemorialStore();

  const [isVerified, setIsVerified] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"edit" | "delete">("edit");
  const [showRitual, setShowRitual] = useState(false);
  const [showCollaboratePanel, setShowCollaboratePanel] = useState(false);

  useEffect(() => {
    loadMemorials();
    loadFamilyRelations();
    loadDriftBottles();
  }, [loadMemorials, loadFamilyRelations, loadDriftBottles]);

  const memorial = id ? getMemorial(id) : undefined;

  const timelineNodes = useMemo(() => {
    if (!memorial) return [];
    return parseBiographyToTimeline(memorial.biography, memorial.birthDate, memorial.deathDate);
  }, [memorial]);

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
  const theme = memorial.theme;
  const displayMode = memorial.biographyDisplayMode ?? "text";
  const collaborators = id ? getCollaborators(id) : [];
  const contributions = id ? getContributions(id) : [];
  const currentCollaborator = collaborators.find((c) => c.id === currentCollaboratorId);
  const isCollaborator = !!currentCollaborator;

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
    <div className={cn("memorial-page pb-20 md:pt-20 relative", `theme-${theme}`)}>
      <ThemeSelector
        memorialId={memorial.id}
        currentTheme={memorial.theme}
        adminPasswordHash={memorial.adminPassword || memorial.password}
      />
      <FestivalDecorations theme={memorial.theme} />
      <div className="relative z-10">
        <div className="sticky top-16 md:top-20 z-30 theme-topbar">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              to="/"
              className={cn(
                "inline-flex items-center gap-2 transition-colors",
                theme === "starry"
                  ? "text-gray-300 hover:text-white"
                  : "text-memorial-600 hover:text-memorial-800"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回</span>
            </Link>

            <div className="flex items-center gap-1">
              {isCollaborator && (
                <button
                  onClick={() => navigate(`/collaborate/${id}`)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    theme === "starry"
                      ? "bg-purple-500/30 text-purple-200 hover:bg-purple-500/40"
                      : "bg-memorial-100 text-memorial-700 hover:bg-memorial-200"
                  )}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">协作编辑</span>
                </button>
              )}
              <button
                onClick={() => setShowCollaboratePanel(true)}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  theme === "starry"
                    ? "hover:bg-white/10 text-gray-200"
                    : "hover:bg-memorial-100 text-memorial-600"
                )}
                title="协作编辑"
              >
                <UserPlus className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    theme === "starry"
                      ? "hover:bg-white/10 text-gray-200"
                      : "hover:bg-memorial-100 text-memorial-600"
                  )}
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showAdminMenu && (
                  <div
                    className={cn(
                      "absolute right-0 top-10 rounded-xl shadow-lg py-2 min-w-[140px] z-50",
                      theme === "starry"
                        ? "bg-slate-800/95 border border-slate-600"
                        : "bg-white border border-memorial-100"
                    )}
                  >
                    <button
                      onClick={() => handleAdminAction("edit")}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                        theme === "starry"
                          ? "text-gray-200 hover:bg-white/10"
                          : "text-memorial-700 hover:bg-memorial-50"
                      )}
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </button>
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        setShowCollaboratePanel(true);
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                        theme === "starry"
                          ? "text-gray-200 hover:bg-white/10"
                          : "text-memorial-700 hover:bg-memorial-50"
                      )}
                    >
                      <UserPlus className="w-4 h-4" />
                      协作管理
                    </button>
                    <button
                      onClick={() => handleAdminAction("delete")}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="relative py-12 md:py-16 theme-hero-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-slide-up">
              <div
                className={cn(
                  "w-28 h-28 md:w-36 md:h-36 rounded-full mx-auto mb-5 overflow-hidden border-4 shadow-lg",
                  theme === "starry" ? "border-slate-700 bg-slate-700" : "border-white bg-memorial-100"
                )}
              >
                {memorial.avatar ? (
                  <img
                    src={memorial.avatar}
                    alt={memorial.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full flex items-center justify-center text-4xl",
                      theme === "starry" ? "text-gray-400" : "text-memorial-400"
                    )}
                  >
                    🌿
                  </div>
                )}
              </div>

              <h1
                className={cn(
                  "font-serif text-2xl md:text-3xl lg:text-4xl font-medium mb-2",
                  theme === "starry" ? "text-gray-100" : "text-memorial-950"
                )}
              >
                {memorial.name}
              </h1>

              <div
                className={cn(
                  "flex items-center justify-center gap-3 text-sm md:text-base mb-3",
                  theme === "starry" ? "text-gray-300" : "text-memorial-600"
                )}
              >
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(memorial.birthDate)} — {formatDate(memorial.deathDate)}
                </span>
                <span className={theme === "starry" ? "text-gray-500" : "text-memorial-300"}>
                  |
                </span>
                <span>享年 {age} 岁</span>
              </div>

              {memorial.epitaph && (
                <p
                  className={cn(
                    "font-serif text-base md:text-lg italic mt-3",
                    theme === "starry" ? "text-gray-300" : "text-memorial-700"
                  )}
                >
                  "{memorial.epitaph}"
                </p>
              )}

              {memorial.reminderEnabled && (
                <div
                  className={cn(
                    "mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm",
                    theme === "starry"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-gold-100/80 text-gold-700"
                  )}
                >
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  距离忌日还有 {daysUntil} 天
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowRitual(true)}
                  className={cn(
                    "group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm md:text-base transition-all duration-300",
                    theme === "starry"
                      ? "bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-200 border border-amber-400/30 hover:from-amber-500/40 hover:to-purple-500/40 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/20"
                      : "bg-gradient-to-r from-gold-100 to-cream-100 text-gold-700 border border-gold-300/50 hover:from-gold-200/80 hover:to-cream-200 hover:border-gold-400 hover:shadow-md hover:shadow-gold-300/30"
                  )}
                >
                  <Sparkles
                    className={cn(
                      "w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 group-hover:rotate-12",
                      theme === "starry" ? "text-amber-300" : "text-gold-500"
                    )}
                  />
                  <span className="tracking-wide">开始祭奠仪式</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      theme === "starry"
                        ? "bg-amber-400/20 text-amber-200"
                        : "bg-gold-200/60 text-gold-700"
                    )}
                  >
                    8 个环节
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

      <section className="py-8 md:py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
              <div className="lg:col-span-8 space-y-5 md:space-y-6">
                {memorial.biography && displayMode === "timeline" ? (
                  <BiographyTimeline nodes={timelineNodes} theme={theme} />
                ) : memorial.biography ? (
                  <div className="theme-card rounded-2xl p-5 md:p-6 shadow-sm">
                    <h3
                      className={cn(
                        "font-serif text-lg md:text-xl mb-4",
                        theme === "starry" ? "text-gray-100" : "text-memorial-950"
                      )}
                    >
                      📖 生平介绍
                    </h3>
                    <div className="prose prose-memorial max-w-none">
                      <p
                        className={cn(
                          "leading-relaxed whitespace-pre-wrap font-serif text-sm md:text-base",
                          theme === "starry" ? "text-gray-300" : "text-memorial-700"
                        )}
                      >
                        {memorial.biography}
                      </p>
                    </div>
                  </div>
                ) : null}

                <PhotoGallery photos={memorial.photos} theme={theme} />
                <MessageWall
                  messages={memorial.messages}
                  theme={theme}
                  onAddMessage={(author, content) => {
                    if (id) addMessage(id, { author, content });
                  }}
                />
                <WordCloud
                  messages={memorial.messages}
                  flowers={memorial.flowers}
                  candles={memorial.candles}
                  biography={memorial.biography}
                  epitaph={memorial.epitaph}
                  theme={theme}
                />
              </div>

              <div className="lg:col-span-4 space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <FlowerArea
                    flowers={memorial.flowers}
                    theme={theme}
                    onAddFlower={(data) => {
                      if (id) addFlower(id, data);
                    }}
                  />
                  <CandleArea
                    candles={memorial.candles}
                    theme={theme}
                    onAddCandle={(data) => {
                      if (id) addCandle(id, data);
                    }}
                  />
                </div>

                {id && (
                  <DriftBottleArea
                    memorialId={id}
                    driftBottles={getDriftBottlesForMemorial(id)}
                    onSendBottle={(content) => sendDriftBottle(id, content)}
                    onMarkRead={markDriftBottleRead}
                    theme={theme}
                  />
                )}

                <div className="theme-card rounded-2xl p-5 shadow-sm">
                  <h3
                    className={cn(
                      "font-serif text-lg mb-4 flex items-center gap-2",
                      theme === "starry" ? "text-gray-100" : "text-memorial-950"
                    )}
                  >
                    <QrCode className="w-5 h-5" />
                    二维码铭牌
                  </h3>
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-24 h-24 shrink-0 rounded-lg flex items-center justify-center overflow-hidden",
                        theme === "starry"
                          ? "bg-white/90 border border-slate-600"
                          : "bg-white border border-memorial-100"
                      )}
                    >
                      <QRCodeCard url={fullUrl} name={memorial.name} compact />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm mb-3",
                          theme === "starry" ? "text-gray-300" : "text-memorial-600"
                        )}
                      >
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
                        className={cn(
                          "text-sm underline",
                          theme === "starry"
                            ? "text-gray-300 hover:text-white"
                            : "text-memorial-700 hover:text-memorial-900"
                        )}
                      >
                        下载二维码
                      </button>
                    </div>
                  </div>
                </div>

                {collaborators.length > 0 && (
                  <div className="theme-card rounded-2xl p-5 shadow-sm">
                    <h3
                      className={cn(
                        "font-serif text-lg mb-4 flex items-center gap-2",
                        theme === "starry" ? "text-gray-100" : "text-memorial-950"
                      )}
                    >
                      <Users className="w-5 h-5" />
                      共同编辑
                      <span
                        className={cn(
                          "text-xs font-normal px-2 py-0.5 rounded-full",
                          theme === "starry"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-memorial-100 text-memorial-600"
                        )}
                      >
                        {collaborators.length} 人
                      </span>
                    </h3>
                    <div className="space-y-2.5">
                      {collaborators.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-serif",
                              theme === "starry" ? "bg-slate-600 text-gray-200" : "bg-memorial-200 text-memorial-700"
                            )}
                          >
                            {c.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "font-medium text-sm truncate",
                                theme === "starry" ? "text-gray-200" : "text-memorial-800"
                              )}
                            >
                              {c.name}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                theme === "starry" ? "text-gray-400" : "text-memorial-500"
                              )}
                            >
                              {c.relation}
                            </p>
                          </div>
                        </div>
                      ))}
                      {collaborators.length > 5 && (
                        <p
                          className={cn(
                            "text-xs text-center pt-1",
                            theme === "starry" ? "text-gray-500" : "text-memorial-400"
                          )}
                        >
                          还有 {collaborators.length - 5} 位协作者
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-4 pt-4 border-t",
                        theme === "starry" ? "border-slate-600" : "border-memorial-100"
                      )}
                    >
                      <button
                        onClick={() => setShowCollaboratePanel(true)}
                        className={cn(
                          "inline-flex items-center gap-1 text-sm transition-colors",
                          theme === "starry"
                            ? "text-gray-300 hover:text-white"
                            : "text-memorial-600 hover:text-memorial-800"
                        )}
                      >
                        <UserPlus className="w-4 h-4" />
                        查看详情 / 邀请亲友
                      </button>
                    </div>
                  </div>
                )}

                {contributions.length > 0 && (
                  <div className="theme-card rounded-2xl p-5 shadow-sm">
                    <h3
                      className={cn(
                        "font-serif text-lg mb-4 flex items-center gap-2",
                        theme === "starry" ? "text-gray-100" : "text-memorial-950"
                      )}
                    >
                      <Clock className="w-5 h-5" />
                      最近贡献
                      <span
                        className={cn(
                          "text-xs font-normal px-2 py-0.5 rounded-full",
                          theme === "starry"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-gold-100 text-gold-700"
                        )}
                      >
                        {contributions.length} 条
                      </span>
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {contributions.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          className={cn(
                            "p-2.5 rounded-lg",
                            theme === "starry" ? "bg-white/5" : "bg-memorial-50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={cn(
                                "font-medium text-xs",
                                theme === "starry" ? "text-gray-200" : "text-memorial-800"
                              )}
                            >
                              {c.collaboratorName}
                            </span>
                            <span
                              className={cn(
                                "text-xs",
                                theme === "starry" ? "text-gray-500" : "text-memorial-400"
                              )}
                            >
                              {formatDate(c.createdAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-xs",
                              theme === "starry" ? "text-gray-400" : "text-memorial-600"
                            )}
                          >
                            {c.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                    {contributions.length > 5 && (
                      <div
                        className={cn(
                          "mt-3 pt-3 border-t",
                          theme === "starry" ? "border-slate-600" : "border-memorial-100"
                        )}
                      >
                        <button
                          onClick={() => setShowCollaboratePanel(true)}
                          className={cn(
                            "inline-flex items-center gap-1 text-xs transition-colors",
                            theme === "starry"
                              ? "text-gray-400 hover:text-white"
                              : "text-memorial-500 hover:text-memorial-700"
                          )}
                        >
                          查看全部 {contributions.length} 条记录
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {id && getRelationsForMemorial(id).filter(({ otherMemorial }) => !otherMemorial.isPrivate).length > 0 && (
                  <div className="theme-card rounded-2xl p-5 shadow-sm">
                    <h3
                      className={cn(
                        "font-serif text-lg mb-4 flex items-center gap-2",
                        theme === "starry" ? "text-gray-100" : "text-memorial-950"
                      )}
                    >
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
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl transition-colors",
                              theme === "starry"
                                ? "bg-white/5 hover:bg-white/10"
                                : "bg-memorial-50 hover:bg-memorial-100"
                            )}
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                theme === "starry" ? "bg-slate-600" : "bg-memorial-200"
                              )}
                            >
                              {otherMemorial.avatar ? (
                                <img
                                  src={otherMemorial.avatar}
                                  alt={otherMemorial.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span
                                  className={cn(
                                    "font-serif text-lg",
                                    theme === "starry" ? "text-gray-200" : "text-memorial-700"
                                  )}
                                >
                                  {otherMemorial.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-medium truncate",
                                  theme === "starry" ? "text-gray-200" : "text-memorial-800"
                                )}
                              >
                                {otherMemorial.name}
                              </p>
                              <p
                                className={cn(
                                  "text-sm",
                                  theme === "starry" ? "text-gray-400" : "text-memorial-500"
                                )}
                              >
                                {label}
                              </p>
                            </div>
                          </Link>
                        ))}
                    </div>
                    <div
                      className={cn(
                        "mt-4 pt-4 border-t",
                        theme === "starry" ? "border-slate-600" : "border-memorial-100"
                      )}
                    >
                      <Link
                        to="/family-network"
                        className={cn(
                          "inline-flex items-center gap-1 text-sm transition-colors",
                          theme === "starry"
                            ? "text-gray-300 hover:text-white"
                            : "text-memorial-600 hover:text-memorial-800"
                        )}
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
          <div
            className={cn(
              "rounded-2xl p-6 max-w-sm w-full animate-fade-in",
              theme === "starry" ? "bg-slate-800" : "bg-white"
            )}
          >
            <h3
              className={cn(
                "font-serif text-xl mb-2",
                theme === "starry" ? "text-gray-100" : "text-memorial-950"
              )}
            >
              确认删除
            </h3>
            <p
              className={cn(
                "mb-6 text-sm",
                theme === "starry" ? "text-gray-300" : "text-memorial-600"
              )}
            >
              删除后将无法恢复，确定要删除这个纪念页吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={cn(
                  "flex-1 py-3 border rounded-xl transition-colors text-sm",
                  theme === "starry"
                    ? "border-slate-600 text-gray-300 hover:bg-white/10"
                    : "border-memorial-200 text-memorial-700 hover:bg-memorial-50"
                )}
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
          theme={theme}
        />
      )}

      {showRitual && memorial && (
        <MemorialRitual
          memorial={memorial}
          onClose={() => setShowRitual(false)}
          onComplete={(prayerMessage, offerings) => {
            if (id && prayerMessage.trim()) {
              addMessage(id, {
                author: "祭奠祈愿",
                content: prayerMessage + (offerings.length > 0 ? ` （祭品：${offerings.join("、")}）` : ""),
              });
            }
            setShowRitual(false);
          }}
        />
      )}

      {showCollaboratePanel && id && (
        <CollaboratePanel
          memorialId={id}
          memorialName={memorial.name}
          theme={theme}
          isAdmin={true}
          onClose={() => setShowCollaboratePanel(false)}
        />
      )}
      </div>
    </div>
  );
}

interface PasswordModalProps {
  title: string;
  description: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  theme: string;
}

function PasswordModal({ title, description, onSubmit, onCancel, theme }: PasswordModalProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className={cn(
          "rounded-2xl p-6 max-w-sm w-full animate-fade-in",
          theme === "starry" ? "bg-slate-800" : "bg-white"
        )}
      >
        <h3
          className={cn(
            "font-serif text-xl mb-2",
            theme === "starry" ? "text-gray-100" : "text-memorial-950"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mb-6 text-sm",
            theme === "starry" ? "text-gray-300" : "text-memorial-600"
          )}
        >
          {description}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入管理密码"
            className={cn(
              "w-full px-4 py-3 border rounded-xl focus:outline-none transition-all mb-4",
              theme === "starry"
                ? "bg-slate-700 text-gray-100 placeholder-gray-400 border-slate-600 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                : "border-memorial-200 focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400"
            )}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "flex-1 py-3 border rounded-xl transition-colors text-sm",
                theme === "starry"
                  ? "border-slate-600 text-gray-300 hover:bg-white/10"
                  : "border-memorial-200 text-memorial-700 hover:bg-memorial-50"
              )}
            >
              取消
            </button>
            <button
              type="submit"
              className={cn(
                "flex-1 py-3 text-white rounded-xl transition-colors text-sm font-medium",
                theme === "starry"
                  ? "bg-purple-600 hover:bg-purple-500"
                  : "bg-memorial-700 hover:bg-memorial-600"
              )}
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
