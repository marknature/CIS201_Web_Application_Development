import type { AnalyticsResponse, TicketRecord } from "@/lib/api";

export interface TicketHighlights {
  pending: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  escalated: number;
  critical: number;
}

const getStatusTotal = (analytics: AnalyticsResponse, status: string) =>
  analytics.byStatus.find((item) => item.status === status)?.total || 0;

const getPriorityTotal = (analytics: AnalyticsResponse, priority: string) =>
  analytics.byPriority.find((item) => item.priority === priority)?.total || 0;

export function buildTicketHighlights(analytics: AnalyticsResponse): TicketHighlights {
  if (analytics.summary) {
    return {
      pending: analytics.summary.pendingTickets,
      open: analytics.summary.openTickets,
      inProgress: analytics.summary.inProgressTickets,
      resolved: analytics.summary.resolvedTickets,
      closed: analytics.summary.closedTickets,
      escalated: analytics.summary.escalatedTickets,
      critical: getPriorityTotal(analytics, "Critical"),
    };
  }

  const open = getStatusTotal(analytics, "Open");
  const inProgress = getStatusTotal(analytics, "In Progress");
  const escalated = getStatusTotal(analytics, "Escalated");

  return {
    pending: open + inProgress + escalated,
    open,
    inProgress,
    resolved: getStatusTotal(analytics, "Resolved"),
    closed: getStatusTotal(analytics, "Closed"),
    escalated,
    critical: getPriorityTotal(analytics, "Critical"),
  };
}

export function buildTicketHighlightsFromTickets(tickets: TicketRecord[]): TicketHighlights {
  const totals = tickets.reduce(
    (acc, ticket) => {
      if (ticket.status === "Open") acc.open += 1;
      if (ticket.status === "In Progress") acc.inProgress += 1;
      if (ticket.status === "Resolved") acc.resolved += 1;
      if (ticket.status === "Closed") acc.closed += 1;
      if (ticket.status === "Escalated") acc.escalated += 1;
      if (ticket.priority === "Critical") acc.critical += 1;
      return acc;
    },
    {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      escalated: 0,
      critical: 0,
    },
  );

  return {
    pending: totals.open + totals.inProgress + totals.escalated,
    open: totals.open,
    inProgress: totals.inProgress,
    resolved: totals.resolved,
    closed: totals.closed,
    escalated: totals.escalated,
    critical: totals.critical,
  };
}
