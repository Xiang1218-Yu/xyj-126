import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, Image, Trash2, Save, Lock, Bell, Settings, Users, Plus, AlertCircle, CheckCircle, Palette } from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { compressImage, hashPassword, formatDateShort, verifyPassword } from "@/utils";
import type { Photo, RelationType, Gender, VisualTheme } from "@/types";
import { RELATION_LABELS } from "@/types";
import { THEME_LIST } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export default function CreateMemorial() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    createMemorial,
    updateMemorial,
    getMemorial,
    loadMemorials,
    loadFamilyRelations,
    addFamilyRelation,
    removeFamilyRelation,
    getRelationsForMemorial,
    memorials,
  } = useMemorialStore();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    gender: "unknown" as Gender,
    birthDate: "",
    deathDate: "",
    avatar: "",
    epitaph: "",
    biography: "",
    isPrivate: false,
    password: "",
    adminPassword: "",
    reminderEnabled: false,
    reminderDays: 7,
    theme: "default" as VisualTheme,
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newRelation, setNewRelation] = useState({
    toMemorialId: "",
    relation: "spouse" as RelationType,
    note: "",
  });

  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadMemorials();
    loadFamilyRelations();
  }, [loadMemorials, loadFamilyRelations]);

  useEffect(() => {
    if (isEditing && id) {
      const memorial = getMemorial(id);
      if (memorial) {
        setFormData({
          name: memorial.name,
          gender: memorial.gender,
          birthDate: memorial.birthDate,
          deathDate: memorial.deathDate,
          avatar: memorial.avatar,
          epitaph: memorial.epitaph,
          biography: memorial.biography,
          isPrivate: memorial.isPrivate,
          password: "",
          adminPassword: "",
          reminderEnabled: memorial.reminderEnabled,
          reminderDays: memorial.reminderDays,
          theme: memorial.theme ?? "default",
        });
        setPhotos(memorial.photos);

        if (!memorial.adminPassword && !memorial.password) {
          setIsAdminVerified(true);
        }
      }
    }
  }, [id, getMemorial, isEditing]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  const verifyAdminPasswordLocal = async (password: string): Promise<boolean> => {
    if (!isEditing || !id) return true;
    const memorial = getMemorial(id);
    if (!memorial) return false;
    if (!memorial.adminPassword && !memorial.password) return true;
    if (memorial.adminPassword) {
      return await verifyPassword(password, memorial.adminPassword);
    }
    if (memorial.isPrivate && memorial.password) {
      return await verifyPassword(password, memorial.password);
    }
    return false;
  };

  const requireAdminAction = (action: () => void) => {
    if (!isEditing || isAdminVerified) {
      action();
      return;
    }
    setPendingAction(() => action);
    setShowAdminPasswordModal(true);
  };

  const handleAdminPasswordSubmit = async () => {
    const isValid = await verifyAdminPasswordLocal(adminPasswordInput);
    if (isValid) {
      setIsAdminVerified(true);
      setShowAdminPasswordModal(false);
      setAdminPasswordInput("");
      setAdminPasswordError("");
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        action();
      }
    } else {
      setAdminPasswordError("管理密码错误");
    }
  };

  const handleAdminPasswordCancel = () => {
    setShowAdminPasswordModal(false);
    setAdminPasswordInput("");
    setAdminPasswordError("");
    setPendingAction(null);
  };

  const currentRelations = useMemo(() => {
    if (!isEditing || !id) return [];
    return getRelationsForMemorial(id);
  }, [isEditing, id, getRelationsForMemorial]);

  const availableMemorials = useMemo(() => {
    return memorials.filter(
      (m) => !m.isPrivate && m.id !== id && !currentRelations.some((r) => r.otherMemorial.id === m.id)
    );
  }, [memorials, id, currentRelations]);

  const handleInputChange = (field: string, value: string | boolean | number | Gender) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 400, 0.8);
      handleInputChange("avatar", compressed);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newPhotos: Photo[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 800, 0.75);
        newPhotos.push({
          id: `temp-${Date.now()}-${i}`,
          url: compressed,
          caption: "",
          order: photos.length + i,
        });
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      console.error("Failed to upload photos:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleAddRelation = () => {
    requireAdminAction(() => {
      if (!id || !newRelation.toMemorialId) {
        showToast("error", "请选择要关联的亲属纪念页");
        return;
      }
      if (id === newRelation.toMemorialId) {
        showToast("error", "不能与自己建立亲属关系");
        return;
      }
      const alreadyExists = getRelationsForMemorial(id).some(
        (r) => r.otherMemorial.id === newRelation.toMemorialId
      );
      if (alreadyExists) {
        showToast("error", "已与该纪念页存在亲属关系");
        return;
      }
      const result = addFamilyRelation(id, newRelation.toMemorialId, newRelation.relation, newRelation.note);
      if (result) {
        setNewRelation({ toMemorialId: "", relation: "spouse", note: "" });
        showToast("success", "亲属关系添加成功");
      } else {
        showToast("error", "添加亲属关系失败，请重试");
      }
    });
  };

  const handleRemoveRelation = (relationId: string) => {
    requireAdminAction(() => {
      removeFamilyRelation(relationId);
      showToast("success", "亲属关系已删除");
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入逝者姓名";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "请选择出生日期";
    }
    if (!formData.deathDate) {
      newErrors.deathDate = "请选择逝世日期";
    }
    if (formData.isPrivate && !formData.password && !isEditing) {
      newErrors.password = "请设置访问密码";
    }
    if (!formData.isPrivate && !formData.adminPassword && !isEditing) {
      newErrors.adminPassword = "请设置管理密码";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEditing && !isAdminVerified) {
      requireAdminAction(async () => {
        await doSubmit();
      });
      return;
    }

    await doSubmit();
  };

  const doSubmit = async () => {
    setIsSubmitting(true);

    try {
      const existingMemorial = isEditing ? getMemorial(id!) : null;

      let passwordHash = "";
      if (formData.isPrivate) {
        if (formData.password) {
          passwordHash = await hashPassword(formData.password);
        } else if (existingMemorial) {
          passwordHash = existingMemorial.password;
        }
      }

      let adminPasswordHash = "";
      if (formData.adminPassword) {
        adminPasswordHash = await hashPassword(formData.adminPassword);
      } else if (formData.isPrivate && passwordHash) {
        adminPasswordHash = passwordHash;
      } else if (existingMemorial) {
        adminPasswordHash = existingMemorial.adminPassword;
      }

      if (isEditing && id) {
        updateMemorial(id, {
          ...formData,
          photos,
          password: passwordHash,
          adminPassword: adminPasswordHash,
        });
      } else {
        const newMemorial = createMemorial({
          ...formData,
          photos,
          password: passwordHash,
          adminPassword: adminPasswordHash,
        });
        navigate(`/memorial/${newMemorial.id}`);
        return;
      }

      navigate(`/memorial/${id}`);
    } catch (error) {
      console.error("Failed to save memorial:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link
              to={isEditing ? `/memorial/${id}` : "/"}
              className="p-2 rounded-full hover:bg-memorial-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-memorial-700" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-memorial-950 font-medium">
                {isEditing ? "编辑纪念页" : "创建纪念页"}
              </h1>
              <p className="text-memorial-500 text-sm">
                {isEditing ? "修改逝者信息" : "为逝去的亲人创建专属纪念空间"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl text-memorial-950 mb-6">基本信息</h2>

              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="shrink-0">
                  <label className="block text-sm text-memorial-600 mb-2">头像</label>
                  <div
                    className="w-32 h-32 rounded-xl bg-memorial-50 border-2 border-dashed border-memorial-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-memorial-400 transition-colors relative group"
                    onClick={() => document.getElementById("avatar-input")?.click()}
                  >
                    {formData.avatar ? (
                      <>
                        <img
                          src={formData.avatar}
                          alt="头像"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm">更换</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Image className="w-8 h-8 text-memorial-400 mx-auto mb-1" />
                        <span className="text-xs text-memorial-400">点击上传</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm text-memorial-600 mb-2">
                      逝者姓名 <span className="text-candle-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                        errors.name ? "border-red-400" : "border-memorial-200"
                      }`}
                      placeholder="请输入逝者姓名"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-memorial-600 mb-2">性别</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleInputChange("gender", "male" as Gender)}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          formData.gender === "male"
                            ? "border-memorial-600 bg-memorial-50 text-memorial-700"
                            : "border-memorial-200 text-memorial-500 hover:border-memorial-300"
                        }`}
                      >
                        <span>👨</span>
                        <span>男性</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange("gender", "female" as Gender)}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          formData.gender === "female"
                            ? "border-memorial-600 bg-memorial-50 text-memorial-700"
                            : "border-memorial-200 text-memorial-500 hover:border-memorial-300"
                        }`}
                      >
                        <span>👩</span>
                        <span>女性</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange("gender", "unknown" as Gender)}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          formData.gender === "unknown"
                            ? "border-memorial-600 bg-memorial-50 text-memorial-700"
                            : "border-memorial-200 text-memorial-500 hover:border-memorial-300"
                        }`}
                      >
                        <span>❓</span>
                        <span>未知</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-memorial-600 mb-2">
                        出生日期 <span className="text-candle-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                          errors.birthDate ? "border-red-400" : "border-memorial-200"
                        }`}
                      />
                      {errors.birthDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-memorial-600 mb-2">
                        逝世日期 <span className="text-candle-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.deathDate}
                        onChange={(e) => handleInputChange("deathDate", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                          errors.deathDate ? "border-red-400" : "border-memorial-200"
                        }`}
                      />
                      {errors.deathDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.deathDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-memorial-600 mb-2">墓志铭 / 一句话简介</label>
                <input
                  type="text"
                  value={formData.epitaph}
                  onChange={(e) => handleInputChange("epitaph", e.target.value)}
                  className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                  placeholder="例如：音容宛在，永垂不朽"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl text-memorial-950 mb-4">生平介绍</h2>
              <textarea
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all resize-none"
                placeholder="讲述逝者的生平故事..."
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-memorial-950">相册</h2>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 text-memorial-600 hover:text-memorial-800 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  添加照片
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotosUpload}
              />

              {photos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square">
                      <img
                        src={photo.url}
                        alt={photo.caption || "照片"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-memorial-200 rounded-xl py-12 text-center cursor-pointer hover:border-memorial-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="w-12 h-12 text-memorial-300 mx-auto mb-2" />
                  <p className="text-memorial-400 text-sm">点击或拖拽上传照片</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl text-memorial-950 mb-6">安全设置</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-memorial-600" />
                    </div>
                    <div>
                      <p className="font-medium text-memorial-900">私密访问</p>
                      <p className="text-sm text-memorial-500">开启后需要密码才能查看内容</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        formData.isPrivate ? "bg-memorial-700" : "bg-memorial-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData.isPrivate ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {formData.isPrivate && (
                  <div className="pl-13">
                    <label className="block text-sm text-memorial-600 mb-2">
                      访问密码 {!isEditing && <span className="text-candle-600">*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                        errors.password ? "border-red-400" : "border-memorial-200"
                      }`}
                      placeholder={isEditing ? "留空则不修改密码" : "设置访问密码"}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                    <p className="text-xs text-memorial-400 mt-2">
                      访问密码同时可用于管理编辑
                    </p>
                  </div>
                )}

                <div className="border-t border-memorial-100 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <p className="font-medium text-memorial-900">管理密码</p>
                      <p className="text-sm text-memorial-500">用于编辑和删除纪念页</p>
                    </div>
                  </div>
                  <div className="pl-13">
                    <label className="block text-sm text-memorial-600 mb-2">
                      管理密码 {!isEditing && !formData.isPrivate && <span className="text-candle-600">*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                        errors.adminPassword ? "border-red-400" : "border-memorial-200"
                      }`}
                      placeholder={isEditing ? "留空则不修改密码" : "设置管理密码"}
                    />
                    {errors.adminPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.adminPassword}</p>
                    )}
                    <p className="text-xs text-memorial-400 mt-2">
                      {formData.isPrivate
                        ? "如已设置访问密码，可留空与访问密码保持一致"
                        : "建议设置管理密码以保护纪念页"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl text-memorial-950 mb-6">提醒设置</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <p className="font-medium text-memorial-900">忌日提醒</p>
                      <p className="text-sm text-memorial-500">纪念日到来前收到提醒通知</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminderEnabled}
                      onChange={(e) => handleInputChange("reminderEnabled", e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        formData.reminderEnabled ? "bg-gold-500" : "bg-memorial-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData.reminderEnabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <div className="pl-13">
                    <label className="block text-sm text-memorial-600 mb-2">提前提醒天数</label>
                    <select
                      value={formData.reminderDays}
                      onChange={(e) => handleInputChange("reminderDays", Number(e.target.value))}
                      className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                    >
                      <option value={1}>提前 1 天</option>
                      <option value={3}>提前 3 天</option>
                      <option value={7}>提前 7 天</option>
                      <option value={14}>提前 14 天</option>
                      <option value={30}>提前 30 天</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-memorial-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-memorial-950">视觉主题</h2>
                    <p className="text-sm text-memorial-500">为纪念页选择合适的视觉风格</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {THEME_LIST.map((t) => {
                  const isActive = formData.theme === t.id;
                  const isStarry = t.id === "starry";
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleInputChange("theme", t.id as VisualTheme)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2",
                        isActive
                          ? "border-memorial-600 bg-memorial-50 ring-2 ring-memorial-400/40"
                          : "border-memorial-200 hover:border-memorial-400"
                      )}
                      style={{ background: isActive ? undefined : t.cardBg }}
                    >
                      <span className="text-3xl">{t.icon}</span>
                      <div className="text-center">
                        <p
                          className={cn(
                            "font-medium text-sm",
                            isStarry ? "text-gray-100" : "text-memorial-800"
                          )}
                        >
                          {t.name}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-0.5 leading-tight",
                            isStarry ? "text-gray-400" : "text-memorial-500"
                          )}
                        >
                          {t.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className={cn(
                          "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white",
                          isStarry ? "bg-purple-500" : "bg-memorial-600"
                        )}>
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-memorial-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-memorial-600" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl text-memorial-950">亲属关系</h2>
                      <p className="text-sm text-memorial-500">管理与其他纪念页的亲属关系</p>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <>
                    {currentRelations.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-memorial-700 mb-3">已关联的亲属</h3>
                        <div className="space-y-2">
                          {currentRelations.map(({ relation, otherMemorial, label }) => (
                            <div
                              key={relation.id}
                              className="flex items-center justify-between bg-memorial-50 rounded-xl p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-memorial-200 flex items-center justify-center font-serif text-memorial-700">
                                  {otherMemorial.name.charAt(0)}
                                </div>
                                <div>
                                  <Link
                                    to={`/memorial/${otherMemorial.id}`}
                                    className="font-medium text-memorial-800 hover:text-memorial-600"
                                  >
                                    {otherMemorial.name}
                                  </Link>
                                  <p className="text-sm text-memorial-500">{label}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveRelation(relation.id)}
                                className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-memorial-400 hover:text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-memorial-100 pt-6">
                      <h3 className="text-sm font-medium text-memorial-700 mb-4">添加亲属关系</h3>
                      {availableMemorials.length > 0 ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-memorial-600 mb-2">选择亲属</label>
                            <select
                              value={newRelation.toMemorialId}
                              onChange={(e) => setNewRelation((prev) => ({ ...prev, toMemorialId: e.target.value }))}
                              className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                            >
                              <option value="">请选择要关联的纪念页</option>
                              {availableMemorials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({formatDateShort(m.birthDate)} - {formatDateShort(m.deathDate)})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-memorial-600 mb-2">亲属关系</label>
                            <select
                              value={newRelation.relation}
                              onChange={(e) => setNewRelation((prev) => ({ ...prev, relation: e.target.value as RelationType }))}
                              className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                            >
                              {Object.entries(RELATION_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-memorial-600 mb-2">备注（可选）</label>
                            <input
                              type="text"
                              value={newRelation.note}
                              onChange={(e) => setNewRelation((prev) => ({ ...prev, note: e.target.value }))}
                              placeholder="例如：父亲的弟弟"
                              className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddRelation}
                            disabled={!newRelation.toMemorialId}
                            className="w-full inline-flex items-center justify-center gap-2 bg-memorial-100 text-memorial-700 py-3 rounded-xl hover:bg-memorial-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            添加亲属关系
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-memorial-50 rounded-xl">
                          <Users className="w-12 h-12 text-memorial-300 mx-auto mb-3" />
                          <p className="text-memorial-500 text-sm">
                            {memorials.length <= 1
                              ? "暂无其他纪念页可关联，请先创建更多纪念页"
                              : "已与所有公开纪念页建立关联"}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-memorial-50 rounded-xl">
                    <Users className="w-12 h-12 text-memorial-300 mx-auto mb-3" />
                    <p className="text-memorial-600 text-sm mb-2">
                      保存纪念页后可添加亲属关系
                    </p>
                    <p className="text-memorial-400 text-xs">
                      创建成功后，在编辑页面管理亲属关系
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-memorial-100">
                  <Link
                    to="/family-network"
                    className="inline-flex items-center gap-2 text-sm text-memorial-600 hover:text-memorial-800"
                  >
                    <Users className="w-4 h-4" />
                    查看亲属关系网络图
                  </Link>
                </div>
              </div>

            <div className="flex gap-4">
              <Link
                to={isEditing ? `/memorial/${id}` : "/"}
                className="flex-1 py-4 text-center border border-memorial-300 text-memorial-700 rounded-xl hover:bg-memorial-50 transition-colors font-medium"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-memorial-950 text-cream-100 py-4 rounded-xl hover:bg-memorial-800 transition-colors font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? "保存中..." : isEditing ? "保存修改" : "创建纪念页"}
              </button>
            </div>
          </form>
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

      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-memorial-100 flex items-center justify-center">
                <Lock className="w-7 h-7 text-memorial-600" />
              </div>
              <h3 className="font-serif text-xl text-memorial-950 mb-1">请输入管理密码</h3>
              <p className="text-sm text-memorial-500">验证身份后才能进行此操作</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminPasswordError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdminPasswordSubmit();
                  }}
                  placeholder="请输入管理密码"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                    adminPasswordError ? "border-red-400" : "border-memorial-200"
                  }`}
                  autoFocus
                />
                {adminPasswordError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {adminPasswordError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAdminPasswordCancel}
                  className="flex-1 py-3 border border-memorial-300 text-memorial-700 rounded-xl hover:bg-memorial-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAdminPasswordSubmit}
                  disabled={!adminPasswordInput}
                  className="flex-1 py-3 bg-memorial-950 text-cream-100 rounded-xl hover:bg-memorial-800 transition-colors font-medium disabled:opacity-50"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
