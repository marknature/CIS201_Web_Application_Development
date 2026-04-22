import { cn } from "@/lib/utils";

export type Status = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed" | "Escalated";
export type Priority = "Low" | "Medium" | "High" | "Critical";

const statusStyles: Record<Status, string> = {
  Open: "bg-info/15 text-info",
  Assigned: "bg-primary/15 text-primary",
  "In Progress": "bg-warning/15 text-warning",
  Resolved: "bg-success/15 text-success",
  Closed: "bg-secondary text-secondary-foreground",
  Escalated: "bg-destructive/15 text-destructive",
};

const statusDotStyles: Record<Status, string> = {
  Open: "bg-info",
  Assigned: "bg-primary",
  "In Progress": "bg-warning",
  Resolved: "bg-success",
  Closed: "bg-foreground",
  Escalated: "bg-destructive",
};

const priorityStyles: Record<Priority, string> = {
  Low: "text-muted-foreground",
  Medium: "text-info",
  High: "text-warning",
  Critical: "text-destructive",
};

const priorityDotStyles: Record<Priority, string> = {
  Low: "bg-slate-400",
  Medium: "bg-info",
  High: "bg-warning",
  Critical: "bg-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      role="status"
      aria-label={`Status: ${status}`}
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-border/50",
        statusStyles[status],
      )}
    >
      <span className={cn("w-2 h-2 rounded-full mr-2", statusDotStyles[status])} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Priority: ${priority}`}>
      <span className={cn("w-2 h-2 rounded-full", priorityDotStyles[priority])} />
      <span className={cn("text-xs font-medium", priorityStyles[priority])}>{priority}</span>
    </span>
  );
}
