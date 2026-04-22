import { cn } from "@/lib/utils";

const toneByValue: Record<string, { container: string; dot: string }> = {
  Open: {
    container: "border-red-100 bg-red-50 text-red-700",
    dot: "bg-primary",
  },
  Reported: {
    container: "border-red-100 bg-red-50 text-red-700",
    dot: "bg-primary",
  },
  Assigned: {
    container: "border-blue-100 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  "In Progress": {
    container: "border-blue-100 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  Triaged: {
    container: "border-blue-100 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  Resolved: {
    container: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Closed: {
    container: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Escalated: {
    container: "border-amber-100 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  Low: {
    container: "border-sky-100 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  Medium: {
    container: "border-amber-100 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  High: {
    container: "border-red-100 bg-red-50 text-red-700",
    dot: "bg-primary",
  },
  Critical: {
    container: "border-red-200 bg-red-100 text-red-800",
    dot: "bg-red-700",
  },
};

export function StatusChip({ value }: { value: string }) {
  const tone = toneByValue[value] || {
    container: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
        tone.container,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
      {value}
    </span>
  );
}
