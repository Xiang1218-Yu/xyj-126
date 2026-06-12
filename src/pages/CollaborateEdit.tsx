import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  BookOpen,
  Image,
  Upload,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { compressImage, parseBiographyToTimeline } from "@/utils";
import type { Photo, BiographyDisplayMode } from "@/types";
import { cn } from "@/lib/utils";
import BiographyTimeline from "@/components/BiographyTimeline";

export default function CollaborateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    loadMemorials,
    getMemorial,
    updateMemorial,
    addPhoto,
    currentCollaboratorId,
    getCollaborators,
    addContribution,
    setCurrentCollaborator,
    getContributions,
  } = useMemorialStore();

  const [biography, setBiography] = useState("");
  const [epitaph, setEpitaph] = useState("");
  const [biographyDisplayMode, setBiographyDisplayMode] = useState<BiographyDisplayMode>("text");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showTimelinePreview, setShowTimelinePreview] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  const memorial = id ? getMemorial(id) : undefined;
  const collaborators = id ? getCollaborators(id) : [];
  const contributions = id ? getContributions(id) : [];
  const currentCollaborator = collaborators.find((c) => c.id === currentCollaboratorId);

  const timelinePreviewNodes = useMemo(() => {
    if (!memorial) return [];
    return parseBiographyToTimeline(biography, memorial.birthDate, memorial.deathDate);
  }, [biography, memorial]);

  useEffect(() => {
    if (memorial) {
      setBiography(memorial.biography);
      setEpitaph(memorial.epitaph);
      setBiographyDisplayMode(memorial.biographyDisplayMode ?? "text");
      setPhotos(memorial.photos);
    }
  }, [memorial]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  if (!memorial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 pb-20 md:pt-20">
        <div className="text-center">
          <p className="text-memorial-500 mb-4">纪念页不存在</p>
          <Link to="/" className="inline-flex items-center gap-2 text-memorial-700 hover:text-memorial-900">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCollaborator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 p-4 pb-20 md:pt-20">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-100 flex items-center justify-center">
            <User className="w-8 h-8 text-memorial-500" />
          </div>
          <h1 className="font-serif text-xl text-memorial-950 mb-2">尚未加入协作</h1>
          <p className="text-memorial-500 mb-6 text-sm">
            请通过邀请链接加入后再进行编辑
          </p>
          <Link
            to={`/memorial/${id}`}
            className="inline-flex items-center gap-2 text-memorial-700 hover:text-memorial-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回纪念页
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveBiography = () => {
    if (!id || !currentCollaborator) return;
    setIsSaving(true);
    updateMemorial(id, { biography, biographyDisplayMode });
    addContribution(
      id,
      currentCollaborator.id,
      currentCollaborator.name,
      "biography",
      "更新了生平介绍",
      biographyDisplayMode === "timeline" ? "时间轴模式" : "文字模式"
    );
    showToast("success", "生平介绍已保存");
    setIsSaving(false);
  };

  const handleSaveEpitaph = () => {
    if (!id || !currentCollaborator) return;
    setIsSaving(true);
    updateMemorial(id, { epitaph });
    addContribution(
      id,
      currentCollaborator.id,
      currentCollaborator.name,
      "epitaph",
      "更新了墓志铭",
      epitaph
    );
    showToast("success", "墓志铭已保存");
    setIsSaving(false);
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !id || !currentCollaborator) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 800, 0.75);
        addPhoto(id, { url: compressed, caption: "" }, currentCollaborator.id, currentCollaborator.name);
      }
      addContribution(
        id,
        currentCollaborator.id,
        currentCollaborator.name,
        "photo",
        `上传了 ${files.length} 张照片`
      );
      const updated = getMemorial(id);
      if (updated) setPhotos(updated.photos);
      showToast("success", `成功上传 ${files.length} 张照片`);
    } catch (error) {
      console.error("Failed to upload photos:", error);
      showToast("error", "照片上传失败");
    }

    e.target.value = "";
  };

  const handleLogout = () => {
    setCurrentCollaborator(null);
    navigate(`/memorial/${id}`);
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to={`/memorial/${id}`}
                className="p-2 rounded-full hover:bg-memorial-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-memorial-700" />
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl text-memorial-950 font-medium">
                  协作编辑
                </h1>
                <p className="text-memorial-500 text-sm">{memorial.name} 的纪念页</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-memorial-100 px-3 py-1.5 rounded-full">
                <div className="w-6 h-6 rounded-full bg-memorial-300 flex items-center justify-center text-xs font-serif text-memorial-800">
                  {currentCollaborator.name.charAt(0)}
                </div>
                <span className="text-sm text-memorial-700">{currentCollaborator.name}</span>
                <span className="text-xs text-memorial-500">· {currentCollaborator.relation}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-memorial-100 transition-colors text-memorial-500"
                title="退出协作"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-memorial-950">墓志铭</h2>
                    <p className="text-sm text-memorial-500">一句话简介</p>
                  </div>
                </div>
                <button
                  onClick={handleSaveEpitaph}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-memorial-700 text-white rounded-lg hover:bg-memorial-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
              <input
                type="text"
                value={epitaph}
                onChange={(e) => setEpitaph(e.target.value)}
                className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                placeholder="例如：音容宛在，永垂不朽"
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-memorial-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-memorial-950">生平介绍</h2>
                    <p className="text-sm text-memorial-500">讲述逝者的生平故事</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTimelinePreview(!showTimelinePreview)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors",
                      showTimelinePreview
                        ? "bg-memorial-100 text-memorial-700"
                        : "text-memorial-500 hover:text-memorial-700 hover:bg-memorial-50"
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    {showTimelinePreview ? "隐藏预览" : "预览"}
                  </button>
                  <button
                    onClick={handleSaveBiography}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-memorial-700 text-white rounded-lg hover:bg-memorial-600 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-memorial-600 mb-2">展示方式</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBiographyDisplayMode("text")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm",
                      biographyDisplayMode === "text"
                        ? "border-memorial-600 bg-memorial-50 text-memorial-700"
                        : "border-memorial-200 text-memorial-500 hover:border-memorial-300"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    <span>纯文字展示</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiographyDisplayMode("timeline")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm",
                      biographyDisplayMode === "timeline"
                        ? "border-memorial-600 bg-memorial-50 text-memorial-700"
                        : "border-memorial-200 text-memorial-500 hover:border-memorial-300"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    <span>时间轴展示</span>
                  </button>
                </div>
              </div>

              <textarea
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all resize-none"
                placeholder="讲述逝者的生平故事...&#10;提示：可在段落中包含日期，时间轴模式会自动识别"
              />

              {showTimelinePreview && (
                <div className="mt-5 pt-5 border-t border-memorial-100">
                  <h3 className="text-sm font-medium text-memorial-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    预览
                    {timelinePreviewNodes.length > 0 && (
                      <span className="text-xs text-memorial-400 font-normal">
                        （已识别 {timelinePreviewNodes.length} 个时间节点）
                      </span>
                    )}
                  </h3>
                  <BiographyTimeline nodes={timelinePreviewNodes} theme="default" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center">
                    <Image className="w-5 h-5 text-memorial-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-memorial-950">相册</h2>
                    <p className="text-sm text-memorial-500">上传珍贵的回忆照片</p>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-memorial-100 text-memorial-700 rounded-lg hover:bg-memorial-200 transition-colors text-sm font-medium cursor-pointer">
                  <Upload className="w-4 h-4" />
                  上传照片
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotosUpload}
                  />
                </label>
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square group">
                      <img
                        src={photo.url}
                        alt={photo.caption || "照片"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-memorial-200 rounded-xl py-12 text-center">
                  <Image className="w-12 h-12 text-memorial-300 mx-auto mb-2" />
                  <p className="text-memorial-400 text-sm">暂无照片，点击上方按钮上传</p>
                </div>
              )}
            </div>

            {contributions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-memorial-950">最近贡献</h2>
                    <p className="text-sm text-memorial-500">所有协作者的编辑记录</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {contributions.slice(0, 10).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-memorial-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-memorial-200 flex items-center justify-center text-xs font-serif text-memorial-700 shrink-0">
                        {c.collaboratorName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-memorial-900">
                            {c.collaboratorName}
                          </span>
                          <span className="text-xs text-memorial-400">
                            {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        <p className="text-sm text-memorial-700">{c.summary}</p>
                        {c.detail && (
                          <p className="text-xs text-memorial-500 mt-0.5">{c.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
