
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Video,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  LoaderCircle,
  BellRing,
} from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

function getNotificationIcon(type: string) {
  switch (type) {
    case "upload":
      return ImageIcon;
    case "video":
      return Video;
    case "background_removal":
      return Sparkles;
    case "security":
      return ShieldCheck;
    default:
      return BellRing;
  }
}

function formatNotificationDate(date: string) {
  const notificationDate = new Date(date);
  const now = new Date();
  const difference = now.getTime() - notificationDate.getTime();

  if (difference < 60_000) return "Just now";
  if (difference < 3_600_000) {
    return `${Math.floor(difference / 60_000)}m ago`;
  }
  if (difference < 86_400_000) {
    return `${Math.floor(difference / 3_600_000)}h ago`;
  }
  if (difference < 604_800_000) {
    return `${Math.floor(difference / 86_400_000)}d ago`;
  }

  return notificationDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load notifications.");
      }

      const data: NotificationResponse = await response.json();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError("");
    } catch (err) {
      console.error("Notification fetch error:", err);
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30_000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Unable to update notification.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, readAt: new Date().toISOString() }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Mark notification read error:", err);
      setError("Could not update notification.");
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) {
        throw new Error("Unable to update notifications.");
      }

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt ?? now,
        }))
      );

      setUnreadCount(0);
      setError("");
    } catch (err) {
      console.error("Mark all notifications read error:", err);
      setError("Could not update notifications.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;

    setActionLoading(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to clear notifications.");
      }

      setNotifications([]);
      setUnreadCount(0);
      setError("");
    } catch (err) {
      console.error("Clear notifications error:", err);
      setError("Could not clear notifications.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.readAt) {
      await markAsRead(item.id);
    }

    setOpen(false);

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) fetchNotifications();
        }}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.09] hover:text-white"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#101014] bg-violet-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-14 z-50 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/10 bg-[#15151c] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={actionLoading || unreadCount === 0}
                  className="flex items-center gap-1.5 text-xs font-medium text-violet-400 transition hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCheck size={14} />
                  Mark all as read
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 size={13} />
                  Clear all
                </button>
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-white/40">
                  <LoaderCircle size={17} className="animate-spin" />
                  Loading notifications...
                </div>
              ) : error && notifications.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-red-400">
                  {error}
                  <button
                    type="button"
                    onClick={fetchNotifications}
                    className="mt-3 block w-full text-xs text-violet-400 hover:text-violet-300"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/30">
                    <Bell size={22} />
                  </div>
                  <p className="text-sm font-medium text-white/80">
                    No notifications yet
                  </p>
                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-white/40">
                    Updates about your uploads and media processing will appear
                    here.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const Icon = getNotificationIcon(item.type);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className={`flex w-full gap-3 border-b border-white/[0.05] px-4 py-4 text-left transition hover:bg-white/[0.04] ${
                        !item.readAt ? "bg-violet-500/[0.045]" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white/90">
                            {item.title}
                          </p>

                          {!item.readAt && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-white/50">
                          {item.message}
                        </p>

                        <p className="mt-2 text-[10px] text-white/30">
                          {formatNotificationDate(item.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {error && notifications.length > 0 && (
              <p className="border-t border-white/[0.07] px-4 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="border-t border-white/[0.07] px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/home/settings");
                }}
                className="flex w-full items-center justify-center gap-2 text-xs text-white/40 transition hover:text-violet-400"
              >
                <Check size={13} />
                Notification preferences
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
