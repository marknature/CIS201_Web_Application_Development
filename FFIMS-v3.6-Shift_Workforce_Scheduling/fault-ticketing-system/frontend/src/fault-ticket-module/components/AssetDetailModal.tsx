import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Asset } from "../data/mockData";
import { Package, MapPin, DollarSign, Activity, ShoppingCart } from "lucide-react";

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
}

export function AssetDetailModal({ asset, open, onClose }: AssetDetailModalProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Asset Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Asset ID" value={asset.id} mono />
            <InfoRow label="Name" value={asset.name} />
            <InfoRow label="Category" value={asset.category} />
            <InfoRow label="Status" value={asset.status} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{asset.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Value:</span>
              <span className="font-medium">R{asset.value.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm rounded-lg bg-muted p-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Lifecycle Status:</span>
            <span className={`font-medium ${asset.status === "Under Maintenance" ? "text-warning" : "text-success"}`}>
              {asset.status}
            </span>
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={() => alert("Redirecting to Procurement module...")}>
            <ShoppingCart className="h-4 w-4" />
            Request Asset Replacement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
