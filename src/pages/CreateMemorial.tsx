import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, Image, Trash2, Save, Lock, Bell, Settings } from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { compressImage, hashPassword } from "@/utils";
import type { Photo } from "@/types";

export default function CreateMemorial() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createMemorial, updateMemorial, getMemorial, loadMemorials } = useMemorialStore();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
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
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  useEffect(() => {
    if (isEditing && id) {
      const memorial = getMemorial(id);
      if (memorial) {
        setFormData({
          name: memorial.name,
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
        });
        setPhotos(memorial.photos);
      }
    }
  }, [id, getMemorial, isEditing]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
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
    </div>
  );
}
