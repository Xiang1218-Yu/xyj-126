import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Heart,
  Sparkles,
} from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { RELATION_LABELS } from "@/types";
import type { RelationType } from "@/types";

export default function InviteJoin() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const {
    loadMemorials,
    getInviteLinkByToken,
    getMemorial,
    joinMemorialByInvite,
    isLoaded,
  } = useMemorialStore();

  const [name, setName] = useState("");
  const [relation, setRelation] = useState<RelationType>("other");
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [memorialName, setMemorialName] = useState("");

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  useEffect(() => {
    if (!isLoaded || !token) return;

    const invite = getInviteLinkByToken(token);
    if (!invite) {
      setStatus("error");
      setErrorMessage("邀请链接无效");
      return;
    }

    if (!invite.isActive) {
      setStatus("error");
      setErrorMessage("邀请链接已失效");
      return;
    }

    if (new Date(invite.expiresAt) < new Date()) {
      setStatus("error");
      setErrorMessage("邀请链接已过期");
      return;
    }

    if (invite.usedCount >= invite.maxUses) {
      setStatus("error");
      setErrorMessage("邀请链接已达使用上限");
      return;
    }

    const memorial = getMemorial(invite.memorialId);
    if (memorial) {
      setMemorialName(memorial.name);
      setStatus("ready");
    } else {
      setStatus("error");
      setErrorMessage("纪念页不存在");
    }
  }, [isLoaded, token, getInviteLinkByToken, getMemorial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;

    const relationLabel = RELATION_LABELS[relation];
    const result = joinMemorialByInvite(token, name.trim(), relationLabel);

    if (result.success && result.memorial) {
      setStatus("success");
      setTimeout(() => {
        navigate(`/collaborate/${result.memorial!.id}`);
      }, 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-memorial-600 animate-spin mx-auto mb-3" />
          <p className="text-memorial-600">正在验证邀请链接...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-serif text-2xl text-memorial-950 mb-2">邀请链接无效</h1>
          <p className="text-memorial-500 mb-6">{errorMessage}</p>
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

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 p-4">
        <div className="max-w-sm w-full text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-serif text-2xl text-memorial-950 mb-2">加入成功</h1>
          <p className="text-memorial-500 mb-6">
            欢迎加入 {memorialName} 的纪念页协作，正在跳转...
          </p>
          <div className="flex items-center justify-center gap-1 text-memorial-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">即将进入协作编辑页面</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-20 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-memorial-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-memorial-600" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-memorial-950 mb-2">
              邀请您共同编辑
            </h1>
            <p className="text-memorial-500">
              <Heart className="w-4 h-4 inline-block text-candle-500 mx-1" />
              {memorialName} 的纪念页
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-memorial-600 mb-2">
                  您的称呼 <span className="text-candle-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-memorial-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                    placeholder="请输入您的称呼"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-memorial-600 mb-2">
                  与逝者的关系
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as RelationType)}
                  className="w-full px-4 py-3 border border-memorial-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all"
                >
                  {Object.entries(RELATION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 bg-memorial-950 text-cream-100 rounded-xl hover:bg-memorial-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                加入协作
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-memorial-400 mt-6">
            加入后您可以共同编辑纪念页内容，所有贡献都会记录您的署名
          </p>
        </div>
      </div>
    </div>
  );
}
