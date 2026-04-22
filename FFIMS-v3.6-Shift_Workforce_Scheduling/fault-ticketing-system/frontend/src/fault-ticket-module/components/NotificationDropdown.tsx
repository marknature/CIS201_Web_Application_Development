import { Bell, AlertTriangle, UserCheck, RefreshCw, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatRelativeTime,
  getVisibleNotificationsForRole,
} from "../data/demoState";
import { useDemoData } from "../context/DemoDataContext";
import { useRole } from "../context/RoleContext";

const typeIcons = {
  new_fault: AlertTriangle,
  assignment: UserCheck,
  status_change: RefreshCw,
  escalation: ArrowUpRight,
};

const typeColors = {
  new_fault: "text-destructive",
  assignment: "text-primary",
  status_change: "text-warning",
  escalation: "text-destructive",
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { currentRole, currentUser } = useRole();
  const { notifications, markNotificationRead } = useDemoData();

  const visibleNotifications = getVisibleNotificationsForRole(
    notifications,
    currentRole,
    currentUser.name,
  );

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {visibleNotifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            visibleNotifications.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.ticketId) {
                      navigate(`/tickets/${n.ticketId}`);
                    }
                  }}
                  className={cn(
                    "p-3 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className={cn("mt-0.5 shrink-0", typeColors[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.read && "font-medium")}>{n.text}</p>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
