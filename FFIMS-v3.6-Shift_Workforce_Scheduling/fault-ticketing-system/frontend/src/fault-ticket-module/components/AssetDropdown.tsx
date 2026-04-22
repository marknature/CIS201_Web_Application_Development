import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemoData } from "../context/DemoDataContext";

interface AssetDropdownProps {
  value?: string;
  onChange: (assetId: string) => void;
  placeholder?: string;
}

export function AssetDropdown({ value, onChange, placeholder = "Select an asset..." }: AssetDropdownProps) {
  const { assets } = useDemoData();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {assets.map((asset) => (
          <SelectItem key={asset.id} value={asset.id}>
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{asset.id}</span>
              <span>{asset.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
