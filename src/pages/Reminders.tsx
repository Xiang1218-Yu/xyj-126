import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, Clock, ChevronRight, Flower2 } from "lucide-react";
import { useMemorialStore } from "@/store/memorialStore";
import { daysUntilDeathAnniversary, formatDate } from "@/utils";

export default function Reminders() {
  const { memorials, loadMemorials, isLoaded } = useMemorialStore();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    "default"
  );

  useEffect(() => {
    loadMemorials();
  }, [loadMemorials]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const reminders = memorials
    .filter((m) => m.reminderEnabled)
    .map((m) => ({
      ...m,
      daysUntil: daysUntilDeathAnniversary(m.deathDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const upcomingReminders = reminders.filter((r) => r.daysUntil <= 30);
  const laterReminders = reminders.filter((r) => r.daysUntil > 30);

  return (
    <div className="min-h-screen pb-20 md:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-2xl md:text-3xl text-memorial-950 font-medium mb-2">
              忌日提醒
            </h1>
            <p className="text-memorial-500">
              重要的日子，不会忘记
            </p>
          </div>

          {notificationPermission !== "granted" && (
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gold-800 font-medium text-sm mb-1">
                    开启浏览器通知
                  </p>
                  <p className="text-gold-600 text-xs mb-3">
                    开启后可以在忌日到来时收到桌面通知提醒
                  </p>
                  <button
                    onClick={requestNotificationPermission}
                    className="text-sm text-gold-700 font-medium hover:text-gold-900"
                  >
                    {notificationPermission === "denied"
                      ? "已被拒绝，请到浏览器设置中开启"
                      : "开启通知权限"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoaded ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-memorial-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-memorial-100 rounded w-1/3" />
                      <div className="h-4 bg-memorial-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-8">
              {upcomingReminders.length > 0 && (
                <div>
                  <h2 className="font-medium text-memorial-700 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    即将到来（30天内）
                  </h2>
                  <div className="space-y-3">
                    {upcomingReminders.map((memorial, index) => (
                      <Link
                        key={memorial.id}
                        to={`/memorial/${memorial.id}`}
                        className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow group animate-slide-up"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          opacity: 0,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-memorial-100 shrink-0">
                            {memorial.avatar ? (
                              <img
                                src={memorial.avatar}
                                alt={memorial.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-memorial-400 text-xl">
                                🌿
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-memorial-900 truncate">
                                {memorial.name}
                              </h3>
                              {memorial.daysUntil === 0 && (
                                <span className="px-2 py-0.5 bg-candle-100 text-candle-700 text-xs rounded-full">
                                  今天
                                </span>
                              )}
                              {memorial.daysUntil <= 7 && memorial.daysUntil > 0 && (
                                <span className="px-2 py-0.5 bg-gold-100 text-gold-700 text-xs rounded-full">
                                  {memorial.daysUntil}天后
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-memorial-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(memorial.deathDate)} · 忌日
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-2xl font-serif font-medium text-memorial-700">
                              {memorial.daysUntil}
                            </p>
                            <p className="text-xs text-memorial-400">天后</p>
                          </div>

                          <ChevronRight className="w-5 h-5 text-memorial-300 group-hover:text-memorial-500 transition-colors shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {laterReminders.length > 0 && (
                <div>
                  <h2 className="font-medium text-memorial-500 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    更多纪念日
                  </h2>
                  <div className="space-y-2">
                    {laterReminders.map((memorial, index) => (
                      <Link
                        key={memorial.id}
                        to={`/memorial/${memorial.id}`}
                        className="block bg-white/50 rounded-xl p-3 hover:bg-white hover:shadow-sm transition-all group animate-slide-up"
                        style={{
                          animationDelay: `${(upcomingReminders.length + index) * 0.05}s`,
                          opacity: 0,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-memorial-100 shrink-0">
                            {memorial.avatar ? (
                              <img
                                src={memorial.avatar}
                                alt={memorial.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-memorial-400">
                                🌿
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-memorial-700 text-sm truncate">
                              {memorial.name}
                            </h3>
                            <p className="text-xs text-memorial-400">
                              {formatDate(memorial.deathDate)}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-memorial-500">
                              {memorial.daysUntil} 天后
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-memorial-300 group-hover:text-memorial-500 transition-colors shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-2xl">
              <Bell className="w-16 h-16 text-memorial-300 mx-auto mb-4" />
              <h3 className="text-memorial-700 font-medium mb-2">暂无提醒</h3>
              <p className="text-memorial-400 text-sm mb-6">
                创建纪念页时可以开启忌日提醒
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 bg-memorial-950 text-cream-100 px-6 py-3 rounded-xl hover:bg-memorial-800 transition-colors text-sm font-medium"
              >
                <Flower2 className="w-4 h-4" />
                创建纪念页
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
