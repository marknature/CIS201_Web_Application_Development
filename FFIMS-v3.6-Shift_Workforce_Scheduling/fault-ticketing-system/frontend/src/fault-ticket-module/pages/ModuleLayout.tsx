import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { NotificationDropdown } from "../components/NotificationDropdown";
import { CONFIG } from "../config";
import { DemoDataProvider } from "../context/DemoDataContext";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { RoleProvider } from "../context/RoleContext";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ModuleLayout() {
  useEffect(() => {
    if (CONFIG.RUNTIME_MODE === "mock") {
      toast.success("Demo mode enabled", {
        description: "Using persisted mock data so the module remains fully interactive without MySQL.",
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/health");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          toast.success(data?.message || "Backend connected");
        }
      } catch {
        if (!cancelled) {
          toast.error("Backend unreachable", {
            description: "Switch VITE_APP_MODE back to mock or start the API on port 5000.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RoleProvider>
      <DemoDataProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-b from-muted/30 via-background to-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-14 flex items-center justify-between border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Fault & Ticketing Module</span>
                </div>
                <div className="flex items-center gap-3">
                  <RoleSwitcher />
                  <NotificationDropdown />
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </DemoDataProvider>
    </RoleProvider>
  );
}
