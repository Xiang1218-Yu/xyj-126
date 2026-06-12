import { useState } from "react";
import {
  Users,
  Link2,
  Copy,
  Check,
  UserPlus,
  Trash2,
  Clock,
  Shield,
  X,
  Share2,
} from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import type { Collaborator, InviteLink } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils";

interface CollaboratePanelProps {
  memorialId: string;
  memorialName: string;
  theme: string;
  isAdmin: boolean;
  onClose: () => void;
}

export default function CollaboratePanel({
  memorialId,
  memorialName,
  theme,
  isAdmin,
  onClose,
}: CollaboratePanelProps) {
  const {
    getCollaborators,
    createInviteLink,
    removeCollaborator,
    getContributions,
  } = useMemorialStore();

  const [activeTab, setActiveTab] = useState<"invite" | "collaborators" | "contributions">("invite");
  const [copied, setCopied] = useState(false);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [maxUses, setMaxUses] = useState(10);
  const [validDays, setValidDays] = useState(30);

  const collaborators = getCollaborators(memorialId);
  const contributions = getContributions(memorialId);

  const handleCreateInvite = () => {
    const invite = createInviteLink(memorialId, "创建者", maxUses, validDays);
    setInviteLinks((prev) => [invite, ...prev]);
  };

  const inviteUrl = (token: string) =>
    `${window.location.origin}/invite/${token}`;

  const handleCopyLink = async (token: string) => {
    const url = inviteUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isStarry = theme === "starry";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className={cn(
          "rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col animate-fade-in",
          isStarry ? "bg-slate-800 border border-slate-600" : "bg-white"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between p-5 border-b",
            isStarry ? "border-slate-600" : "border-memorial-100"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isStarry ? "bg-purple-500/20" : "bg-memorial-100"
              )}
            >
              <Users
                className={cn(
                  "w-5 h-5",
                  isStarry ? "text-purple-300" : "text-memorial-600"
                )}
              />
            </div>
            <div>
              <h3
                className={cn(
                  "font-serif text-lg",
                  isStarry ? "text-gray-100" : "text-memorial-950"
                )}
              >
                协作编辑
              </h3>
              <p
                className={cn(
                  "text-xs",
                  isStarry ? "text-gray-400" : "text-memorial-500"
                )}
              >
                {memorialName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isStarry
                ? "hover:bg-white/10 text-gray-400 hover:text-white"
                : "hover:bg-memorial-100 text-memorial-500 hover:text-memorial-700"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={cn(
            "flex border-b",
            isStarry ? "border-slate-600" : "border-memorial-100"
          )}
        >
          {[
            { key: "invite", label: "邀请链接", icon: Link2 },
            { key: "collaborators", label: "协作者", icon: Users },
            { key: "contributions", label: "贡献记录", icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm transition-colors relative",
                activeTab === key
                  ? isStarry
                    ? "text-purple-300"
                    : "text-memorial-700"
                  : isStarry
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-memorial-500 hover:text-memorial-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {activeTab === key && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5",
                    isStarry ? "bg-purple-400" : "bg-memorial-600"
                  )}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "invite" && isAdmin && (
            <div className="space-y-5">
              <div
                className={cn(
                  "rounded-xl p-4",
                  isStarry ? "bg-slate-700/50" : "bg-memorial-50"
                )}
              >
                <h4
                  className={cn(
                    "font-medium mb-3 flex items-center gap-2",
                    isStarry ? "text-gray-100" : "text-memorial-900"
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  创建邀请链接
                </h4>
                <div className="space-y-3">
                  <div>
                    <label
                      className={cn(
                        "block text-xs mb-1",
                        isStarry ? "text-gray-400" : "text-memorial-600"
                      )}
                    >
                      最多使用次数
                    </label>
                    <select
                      value={maxUses}
                      onChange={(e) => setMaxUses(Number(e.target.value))}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border text-sm",
                        isStarry
                          ? "bg-slate-700 border-slate-600 text-gray-200"
                          : "bg-white border-memorial-200 text-memorial-800"
                      )}
                    >
                      <option value={1}>1 人</option>
                      <option value={5}>5 人</option>
                      <option value={10}>10 人</option>
                      <option value={20}>20 人</option>
                      <option value={50}>50 人</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={cn(
                        "block text-xs mb-1",
                        isStarry ? "text-gray-400" : "text-memorial-600"
                      )}
                    >
                      有效期限
                    </label>
                    <select
                      value={validDays}
                      onChange={(e) => setValidDays(Number(e.target.value))}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border text-sm",
                        isStarry
                          ? "bg-slate-700 border-slate-600 text-gray-200"
                          : "bg-white border-memorial-200 text-memorial-800"
                      )}
                    >
                      <option value={1}>1 天</option>
                      <option value={7}>7 天</option>
                      <option value={30}>30 天</option>
                      <option value={90}>90 天</option>
                      <option value={365}>1 年</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateInvite}
                    className={cn(
                      "w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors",
                      isStarry
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-memorial-700 hover:bg-memorial-600 text-white"
                    )}
                  >
                    <Share2 className="w-4 h-4" />
                    生成邀请链接
                  </button>
                </div>
              </div>

              {inviteLinks.length > 0 && (
                <div className="space-y-3">
                  <h4
                    className={cn(
                      "text-sm font-medium",
                      isStarry ? "text-gray-200" : "text-memorial-800"
                    )}
                  >
                    已生成的链接
                  </h4>
                  {inviteLinks.map((invite) => (
                    <div
                      key={invite.id}
                      className={cn(
                        "rounded-xl p-3 border",
                        isStarry
                          ? "bg-slate-700/30 border-slate-600"
                          : "bg-white border-memorial-100"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link2
                            className={cn(
                              "w-4 h-4",
                              isStarry ? "text-gray-400" : "text-memorial-500"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs",
                              isStarry ? "text-gray-400" : "text-memorial-500"
                            )}
                          >
                            已使用 {invite.usedCount}/{invite.maxUses} · 有效期至
                            {formatDate(invite.expiresAt)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyLink(invite.token)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors",
                            isStarry
                              ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                              : "bg-memorial-100 text-memorial-700 hover:bg-memorial-200"
                          )}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              复制链接
                            </>
                          )}
                        </button>
                      </div>
                      <div
                        className={cn(
                          "text-xs font-mono truncate px-2 py-1.5 rounded",
                          isStarry
                            ? "bg-slate-900/50 text-gray-400"
                            : "bg-memorial-50 text-memorial-500"
                        )}
                      >
                        {inviteUrl(invite.token)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isAdmin && (
                <div className="text-center py-8">
                  <Shield
                    className={cn(
                      "w-12 h-12 mx-auto mb-3",
                      isStarry ? "text-gray-500" : "text-memorial-300"
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm",
                      isStarry ? "text-gray-400" : "text-memorial-500"
                    )}
                  >
                    仅创建者可生成邀请链接
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "collaborators" && (
            <div className="space-y-3">
              {collaborators.length === 0 ? (
                <div className="text-center py-8">
                  <Users
                    className={cn(
                      "w-12 h-12 mx-auto mb-3",
                      isStarry ? "text-gray-500" : "text-memorial-300"
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm",
                      isStarry ? "text-gray-400" : "text-memorial-500"
                    )}
                  >
                    暂无协作者，快去邀请亲友一起编辑吧
                  </p>
                </div>
              ) : (
                collaborators.map((c: Collaborator) => (
                  <div
                    key={c.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl",
                      isStarry ? "bg-slate-700/30" : "bg-memorial-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-serif",
                          isStarry
                            ? "bg-slate-600 text-gray-200"
                            : "bg-memorial-200 text-memorial-700"
                        )}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-medium text-sm",
                            isStarry ? "text-gray-100" : "text-memorial-900"
                          )}
                        >
                          {c.name}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            isStarry ? "text-gray-400" : "text-memorial-500"
                          )}
                        >
                          {c.relation} · 加入于 {formatDate(c.joinedAt)}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => removeCollaborator(memorialId, c.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isStarry
                            ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                            : "hover:bg-red-50 text-memorial-400 hover:text-red-500"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "contributions" && (
            <div className="space-y-3">
              {contributions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock
                    className={cn(
                      "w-12 h-12 mx-auto mb-3",
                      isStarry ? "text-gray-500" : "text-memorial-300"
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm",
                      isStarry ? "text-gray-400" : "text-memorial-500"
                    )}
                  >
                    暂无贡献记录
                  </p>
                </div>
              ) : (
                contributions.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "p-3 rounded-xl border-l-4",
                      isStarry
                        ? "bg-slate-700/30 border-slate-500"
                        : "bg-memorial-50 border-memorial-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isStarry ? "text-gray-100" : "text-memorial-900"
                        )}
                      >
                        {c.collaboratorName}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          isStarry ? "text-gray-500" : "text-memorial-400"
                        )}
                      >
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm",
                        isStarry ? "text-gray-300" : "text-memorial-700"
                      )}
                    >
                      {c.summary}
                    </p>
                    {c.detail && (
                      <p
                        className={cn(
                          "text-xs mt-1",
                          isStarry ? "text-gray-500" : "text-memorial-500"
                        )}
                      >
                        {c.detail}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
