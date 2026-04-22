import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneStyles = {
  neutral: {
    surface: "border-[#e4e8ef] bg-white",
    accent: "bg-[#1a1a1a]",
    icon: "bg-[#f5f6f8] text-[#1a1a1a]",
    value: "text-foreground",
  },
  critical: {
    surface: "border-red-100 bg-[linear-gradient(135deg,rgba(204,0,0,0.08),rgba(255,255,255,1))]",
    accent: "bg-primary",
    icon: "bg-red-50 text-primary",
    value: "text-primary",
  },
  info: {
    surface: "border-blue-100 bg-[linear-gradient(135deg,rgba(30,120,255,0.08),rgba(255,255,255,1))]",
    accent: "bg-blue-500",
    icon: "bg-blue-50 text-blue-600",
    value: "text-foreground",
  },
  success: {
    surface: "border-emerald-100 bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(255,255,255,1))]",
    accent: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-foreground",
  },
  warning: {
    surface: "border-amber-100 bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(255,255,255,1))]",
    accent: "bg-amber-400",
    icon: "bg-amber-50 text-amber-600",
    value: "text-foreground",
  },
} as const;

export function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
}) {
  const toneStyle = toneStyles[tone];

  return (
    <Card className={cn("relative overflow-hidden rounded-[24px]", toneStyle.surface)}>
      <div className={cn("absolute inset-x-0 top-0 h-1", toneStyle.accent)} />
      <CardContent className="flex items-start justify-between gap-4 p-5 md:p-6">
        <div className="space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          <p className={cn("text-[30px] font-semibold tracking-tight", toneStyle.value)}>{value}</p>
          <p className="max-w-[20rem] text-[13px] leading-6 text-muted-foreground">{hint}</p>
        </div>
        <div className={cn("rounded-[20px] p-3.5 shadow-sm", toneStyle.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
