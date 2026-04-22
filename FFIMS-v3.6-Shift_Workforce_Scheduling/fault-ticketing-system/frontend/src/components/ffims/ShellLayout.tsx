import { useEffect, useMemo, useState, type ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import { NotificationMenu } from "@/components/ffims/NotificationMenu";
import { api, type NotificationRecord, type UserRole } from "@/lib/api";
import { formatRoleLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  roles: UserRole[];
};

const buildNavigation = (role: UserRole): NavItem[] => {
  const dashboardLabel =
    role === "user" ? "User Dashboard" : role === "technician" ? "Technician Dashboard" : "Admin & Operations";

  const ticketsLabel = role === "user" ? "My Tickets" : "Ticket Register";

  return [
    {
      to: "/",
      label: dashboardLabel,
      icon: LayoutDashboard,
      exact: true,
      roles: ["user", "technician", "admin"],
    },
    {
      to: "/fault-ticketing",
      label: "Admin Analytics",
      icon: Activity,
      roles: ["admin"],
    },
    {
      to: "/fault-ticketing/report",
      label: "Report Fault",
      icon: TriangleAlert,
      roles: ["user", "technician", "admin"],
    },
    {
      to: "/fault-ticketing/tickets",
      label: ticketsLabel,
      icon: ClipboardList,
      roles: ["user", "technician", "admin"],
    },
    {
      to: "/fault-ticketing/workspace",
      label: "Technician Workspace",
      icon: Wrench,
      roles: ["technician", "admin"],
    },
  ];
};

const pageMetadata: Record<string, { eyebrow: string; title: string; description: string }> = {
  "/": {
    eyebrow: "FFIMS Workspace",
    title: "Fault Ticketing Command Center",
    description: "Shared module entry point with role-based actions, analytics, and live ticket visibility.",
  },
  "/fault-ticketing": {
    eyebrow: "Module Dashboard",
    title: "Fault Reporting Dashboard",
    description: "Analytics for monitoring active, pending, and resolved issues across FFIMS.",
  },
  "/fault-ticketing/report": {
    eyebrow: "Fault Intake",
    title: "Report a Fault",
    description: "Clean structured form for submitting a fault against a registered FFIMS asset.",
  },
  "/fault-ticketing/tickets": {
    eyebrow: "Ticket Register",
    title: "Tickets List",
    description: "Search, filter, review, and open fault tickets from one responsive register.",
  },
  "/fault-ticketing/workspace": {
    eyebrow: "Operations Desk",
    title: "Technician Workspace",
    description: "Assignment-focused workspace for technicians and administrators managing active queues.",
  },
};

export function ShellLayout() {
  const { logout, token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const navItemBase =
    "group flex w-full min-h-[52px] items-center justify-between rounded-2xl border px-4 py-3 text-[14px] font-medium transition";
  const sidebarActionBase =
    "group flex w-full min-h-[52px] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-medium text-white/72 transition hover:border-white/15 hover:bg-white/8 hover:text-white";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    setNotificationsLoading(true);

    api
      .getNotifications(token)
      .then((notificationData) => {
        if (active) {
          setNotifications(notificationData);
        }
      })
      .catch(() => {
        if (active) {
          setNotifications([]);
        }
      })
      .finally(() => {
        if (active) {
          setNotificationsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

<<<<<<< HEAD
=======
  const handleNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const visibleNavigation = useMemo(() => {
    const role = (user?.role || "user") as UserRole;
    return buildNavigation(role).filter((item) => item.roles.includes(role));
  }, [user?.role]);

  const currentPage = useMemo(() => {
    if (location.pathname === "/") {
      if (user?.role === "user") {
        return {
          eyebrow: "User Dashboard",
          title: "My Fault Tickets",
          description: "Create faults, review only your own tickets, and track their status without operational controls.",
        };
      }

      return {
        eyebrow: "Operations Overview",
        title: "Fault Ticketing Overview",
        description: "Role-based operational landing page for technicians and administrators.",
      };
    }

    if (
      location.pathname.startsWith("/fault-ticketing/") &&
      !pageMetadata[location.pathname]
    ) {
      return {
        eyebrow: "Ticket Detail",
        title: "Ticket Details",
        description: "Structured view of ticket history, comments, workflow controls, and audit activity.",
      };
    }

    return (
      pageMetadata[location.pathname] || {
        eyebrow: "FFIMS",
        title: "Workspace",
        description: "Integrated facilities and fleet service workspace.",
      }
    );
  }, [location.pathname, user?.role]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  return (
    <div className="flex min-h-screen bg-transparent">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#1a1a1a]/55 transition md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[296px] flex-col border-r border-white/10 bg-[#1a1a1a] text-white shadow-2xl transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                FFIMS Suite
              </p>
              <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-white">Fault Module</h1>
              <p className="mt-2 text-[13px] leading-6 text-white/72">
                Fleet &amp; Facilities fault reporting and ticket tracking.
              </p>
            </div>
            <button
              className="rounded-xl border border-white/10 p-2 text-white md:hidden"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  navItemBase,
                  isActive
                    ? "border-transparent bg-primary text-white shadow-[0_18px_36px_-24px_rgba(204,0,0,0.9)]"
                    : "border-white/10 bg-white/5 text-white/72 hover:border-white/15 hover:bg-white/8 hover:text-white",
                )
              }
              to={item.to}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/10 px-4 py-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Signed in as</p>
            <p className="mt-3 text-[16px] font-semibold text-white">{user?.name || "Unknown User"}</p>
            <p className="mt-1 text-[13px] text-white/65">{formatRoleLabel(user?.role)}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-[12px] text-white/72">
              <ShieldCheck className="h-4 w-4 text-white" />
              JWT secured session
            </div>
          </div>

          <button
            className={sidebarActionBase}
            onClick={() => {
              logout();
              navigate("/login");
            }}
            type="button"
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#e6eaf0] bg-[rgba(244,246,248,0.92)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  className="rounded-2xl border border-[#d8dde6] bg-white p-3 shadow-[0_14px_28px_-26px_rgba(26,26,26,0.45)] md:hidden"
                  onClick={() => setMobileOpen(true)}
                  type="button"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="space-y-2">
                  <p className="ffims-kicker text-primary">{currentPage.eyebrow}</p>
                  <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                    {currentPage.title}
                  </h2>
                  <p className="max-w-3xl text-[13px] leading-6 text-muted-foreground">
                    {currentPage.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="ffims-meta-pill">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {formatRoleLabel(user?.role)}
                </span>
                <span className="ffims-meta-pill">{todayLabel}</span>
                <NotificationMenu
                  loading={notificationsLoading}
                  notifications={notifications}
                  unreadCount={unreadNotifications}
<<<<<<< HEAD
=======
                  onNotificationRead={handleNotificationRead}
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
