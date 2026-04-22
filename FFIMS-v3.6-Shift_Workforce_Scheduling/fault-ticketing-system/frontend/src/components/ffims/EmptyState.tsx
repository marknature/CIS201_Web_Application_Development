import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d8dde6] bg-white px-6 py-10 text-center shadow-[0_18px_40px_-32px_rgba(26,26,26,0.35)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f6f8]">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-5 text-[18px] font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-[14px] leading-7 text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
