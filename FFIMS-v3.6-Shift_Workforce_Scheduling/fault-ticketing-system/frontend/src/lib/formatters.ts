export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatRoleLabel(value?: string | null) {
  if (!value) {
    return "User";
  }

  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatMinutes(value?: number | null) {
  if (!value || value <= 0) {
    return "Not available";
  }

  if (value >= 60) {
    const hours = (value / 60).toFixed(1);
    return `${hours} hrs`;
  }

  return `${Math.round(value)} mins`;
}

export function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  return formatter.format(days, "day");
}

export function formatTicketReference(value?: string | null) {
  if (!value) {
    return "TKT-0000";
  }

  const cleaned = String(value).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = cleaned.slice(-6) || "0000";

  return `TKT-${suffix}`;
}
