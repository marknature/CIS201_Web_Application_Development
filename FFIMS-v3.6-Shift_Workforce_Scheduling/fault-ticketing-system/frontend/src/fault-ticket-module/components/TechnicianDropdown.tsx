import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemoData } from "../context/DemoDataContext";

interface TechnicianDropdownProps {
  value?: string;
  onChange: (technicianName: string) => void;
  placeholder?: string;
}

export function TechnicianDropdown({ value, onChange, placeholder = "Select technician..." }: TechnicianDropdownProps) {
  const { technicians } = useDemoData();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {technicians.map((tech) => (
          <SelectItem key={tech.id} value={tech.name}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{tech.name}</span>
              <span className="text-xs text-muted-foreground">({tech.email})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
