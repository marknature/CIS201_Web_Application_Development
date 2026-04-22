import { LayoutDashboard, AlertTriangle, ListTodo, Wrench, Plus } from "lucide-react";
import type { ComponentType } from "react";
import { NavLink } from "@/components/NavLink";
import { CONFIG } from "../config";
import { useRole } from "../context/RoleContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem =
  | { title: string; url: string; icon: ComponentType<{ className?: string }>; permission: string }
  | { title: string; url: string; icon: ComponentType<{ className?: string }>; permissionAny: string[] };

const allNavItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: "view_dashboard" },
  { title: "Report Fault", url: "/report", icon: Plus, permission: "report_fault" },
  { title: "Tickets", url: "/tickets", icon: ListTodo, permissionAny: ["view_all_tickets", "view_own_tickets"] },
  { title: "Technician View", url: "/technician", icon: Wrench, permission: "view_technician" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { hasPermission, currentRole } = useRole();

  const visibleItems = allNavItems.filter((item) => {
    if ("permissionAny" in item) return item.permissionAny.some((p) => hasPermission(p));
    return hasPermission(item.permission);
  });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground">Fault & Ticketing</h2>
              <p className="text-xs text-sidebar-muted">Asset Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      aria-label={item.title}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-muted">Role: <span className="capitalize font-medium text-sidebar-foreground">{currentRole}</span></p>
            <p className="text-xs text-sidebar-muted mt-0.5">
              {CONFIG.RUNTIME_MODE === "mock" ? "Mock demo mode enabled" : "Connected to live backend"}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
