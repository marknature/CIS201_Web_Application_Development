import { createContext, useContext, useState, type ReactNode } from "react";
import { CONFIG } from "../config";
import { type UserRole, seedUsers, type User } from "../data/mockData";

interface RoleContextType {
  currentUser: User;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  hasPermission: (action: string) => boolean;
}

const permissions: Record<UserRole, string[]> = {
  user: ["report_fault", "view_own_tickets", "view_dashboard"],
  technician: ["report_fault", "view_all_tickets", "update_ticket", "assign_ticket", "add_notes", "view_dashboard", "view_technician"],
  admin: ["report_fault", "view_all_tickets", "update_ticket", "assign_ticket", "add_notes", "view_dashboard", "view_technician", "view_analytics", "manage_users"],
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    if (typeof window === "undefined") {
      return "admin";
    }

    const storedRole = window.localStorage.getItem(CONFIG.STORAGE_KEYS.currentRole);
    return storedRole && CONFIG.USER_ROLES.includes(storedRole as UserRole)
      ? (storedRole as UserRole)
      : "admin";
  });

  const currentUser = seedUsers.find((u) => u.role === currentRole) || seedUsers[0];

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    window.localStorage.setItem(CONFIG.STORAGE_KEYS.currentRole, role);
  };

  const hasPermission = (action: string) => permissions[currentRole]?.includes(action) ?? false;

  return (
    <RoleContext.Provider value={{ currentUser, currentRole, setCurrentRole, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
