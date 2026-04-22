<<<<<<< HEAD
import { Bell, BellRing } from "lucide-react";
=======
import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationRecord } from "@/lib/api";
<<<<<<< HEAD
import { formatRelativeTime } from "@/lib/formatters";
=======
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29

interface NotificationMenuProps {
  notifications: NotificationRecord[];
  unreadCount: number;
  loading?: boolean;
<<<<<<< HEAD
=======
  onNotificationRead?: (id: string) => void;
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
}

export function NotificationMenu({
  notifications,
  unreadCount,
  loading = false,
<<<<<<< HEAD
}: NotificationMenuProps) {
  const visibleNotifications = notifications.slice(0, 6);

=======
  onNotificationRead,
}: NotificationMenuProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const visibleNotifications = notifications.slice(0, 6);

  const handleNotificationClick = async (notification: NotificationRecord) => {
    if (!notification.is_read) {
      setMarkingAsRead(notification.id);
      try {
        await api.markNotificationAsRead(notification.id, token);
        onNotificationRead?.(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      } finally {
        setMarkingAsRead(null);
      }
    }

    if (notification.ticket_id) {
      navigate(`/fault-ticketing/${notification.ticket_id}`);
    }
  };

>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-11 items-center gap-3 rounded-2xl border border-[#d8dde6] bg-white px-4 shadow-[0_14px_28px_-26px_rgba(26,26,26,0.45)] transition hover:border-primary/30 hover:bg-[#fff7f7]"
          type="button"
        >
          {unreadCount > 0 ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
          <span className="hidden text-[13px] font-medium text-foreground sm:inline">
            Notifications
          </span>
          <span className="rounded-full bg-[#f5f6f8] px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            {unreadCount}
          </span>
          {unreadCount > 0 ? (
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary" />
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] rounded-[20px] border border-[#e4e8ef] bg-white p-0 shadow-[0_28px_50px_-28px_rgba(26,26,26,0.4)]"
      >
        <div className="p-4">
          <DropdownMenuLabel className="p-0 text-[16px] font-semibold text-foreground">
            Notifications
          </DropdownMenuLabel>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Fault alerts, assignment changes, and workflow updates.
          </p>
        </div>
        <DropdownMenuSeparator className="mx-0" />

        <div className="max-h-[360px] overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-[#edf0f4] bg-[#f8f9fb] p-4"
                >
                  <div className="h-3 w-1/2 rounded bg-[#e1e5eb]" />
                  <div className="mt-3 h-3 w-11/12 rounded bg-[#e1e5eb]" />
                </div>
              ))}
            </div>
          ) : visibleNotifications.length ? (
            visibleNotifications.map((notification) => (
              <div
                key={notification.id}
<<<<<<< HEAD
                className="rounded-2xl border border-transparent px-3 py-3 transition hover:border-[#e4e8ef] hover:bg-[#fafafb]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
=======
                className={`rounded-2xl border border-transparent px-3 py-3 transition cursor-pointer hover:border-[#e4e8ef] hover:bg-[#fafafb]`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
                      notification.is_read ? "bg-[#cfd4dc]" : "bg-primary"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-6 text-foreground">{notification.message}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
<<<<<<< HEAD
=======
                  {markingAsRead === notification.id && (
                    <span className="text-[11px] text-muted-foreground">Marking as read...</span>
                  )}
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-8 text-center">
              <p className="text-[14px] font-semibold text-foreground">No notifications yet</p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                New ticket and assignment updates will appear here.
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
