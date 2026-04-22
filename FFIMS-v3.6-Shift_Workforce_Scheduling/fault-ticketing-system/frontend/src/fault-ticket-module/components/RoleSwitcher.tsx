import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "../context/RoleContext";
import { type UserRole } from "../data/mockData";
import { Shield } from "lucide-react";

const roleLabels: Record<UserRole, string> = {
  user: "User",
  technician: "Technician",
  admin: "Admin",
};

export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-muted-foreground" />
      <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as UserRole)}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
