import { describe, expect, it } from "vitest";
import { buildTicketHighlights } from "@/lib/ticketMetrics";
import type { AnalyticsResponse } from "@/lib/api";

describe("buildTicketHighlights", () => {
  it("prefers the backend summary when it is available", () => {
    const analytics: AnalyticsResponse = {
      byStatus: [
        { status: "Open", total: 2 },
        { status: "In Progress", total: 1 },
      ],
      byPriority: [{ priority: "Critical", total: 3 }],
      averageResolutionMinutes: 0,
      summary: {
        pendingTickets: 7,
        openTickets: 4,
        inProgressTickets: 2,
        resolvedTickets: 1,
        closedTickets: 3,
        escalatedTickets: 1,
      },
    };

    expect(buildTicketHighlights(analytics)).toEqual({
      pending: 7,
      open: 4,
      inProgress: 2,
      resolved: 1,
      closed: 3,
      escalated: 1,
      critical: 3,
    });
  });

  it("derives pending totals when the summary is absent", () => {
    const analytics: AnalyticsResponse = {
      byStatus: [
        { status: "Open", total: 2 },
        { status: "In Progress", total: 3 },
        { status: "Escalated", total: 1 },
        { status: "Resolved", total: 4 },
        { status: "Closed", total: 5 },
      ],
      byPriority: [{ priority: "Critical", total: 2 }],
      averageResolutionMinutes: 125,
    };

    expect(buildTicketHighlights(analytics)).toEqual({
      pending: 6,
      open: 2,
      inProgress: 3,
      resolved: 4,
      closed: 5,
      escalated: 1,
      critical: 2,
    });
  });
});
