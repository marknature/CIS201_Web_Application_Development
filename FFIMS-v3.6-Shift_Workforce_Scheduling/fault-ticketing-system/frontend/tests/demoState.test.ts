import { describe, expect, it } from "vitest";
import {
  addTicketNoteInState,
  assignTicketInState,
  createTicketInState,
  updateTicketStatusInState,
} from "@/fault-ticket-module/data/demoState";
import { createDemoSeedState } from "@/fault-ticket-module/data/mockData";

describe("demo ticket state", () => {
  it("creates a new ticket with a generated id and technician notification", () => {
    const initialState = createDemoSeedState();

    const nextState = createTicketInState(initialState, {
      title: "Projector lamp failure",
      description: "The projector lamp failed during a lecture.",
      assetId: "AST-005",
      category: "Electrical",
      priority: "High",
      reportedBy: "Alice Johnson",
    });

    expect(nextState.tickets[0]?.id).toBe("TKT-009");
    expect(nextState.tickets[0]?.status).toBe("Open");
    expect(nextState.notifications[0]?.text).toContain("Projector lamp failure");
    expect(nextState.notifications[0]?.visibleToRoles).toEqual(["technician"]);
  });

  it("assigns a ticket and records the assignment in the timeline", () => {
    const initialState = createDemoSeedState();

    const nextState = assignTicketInState(initialState, {
      ticketId: "TKT-002",
      technicianName: "Sarah Lee",
      performedBy: "Dr. Admin",
    });

    const updatedTicket = nextState.tickets.find((ticket) => ticket.id === "TKT-002");
    expect(updatedTicket?.assignedTo).toBe("Sarah Lee");
    expect(updatedTicket?.status).toBe("Assigned");
    expect(updatedTicket?.timeline?.at(-1)?.note).toContain("Sarah Lee");
  });

  it("adds notes when the status changes and from manual note entry", () => {
    const initialState = createDemoSeedState();

    const afterStatusUpdate = updateTicketStatusInState(initialState, {
      ticketId: "TKT-001",
      status: "Resolved",
      performedBy: "John Smith",
      note: "Cooling fan replaced and tested.",
    });
    const afterManualNote = addTicketNoteInState(afterStatusUpdate, {
      ticketId: "TKT-001",
      author: "John Smith",
      text: "Monitoring temperatures for another 24 hours.",
    });

    const updatedTicket = afterManualNote.tickets.find((ticket) => ticket.id === "TKT-001");
    expect(updatedTicket?.status).toBe("Resolved");
    expect(updatedTicket?.notes).toHaveLength(3);
    expect(updatedTicket?.notes?.at(-1)?.text).toContain("Monitoring temperatures");
  });
});
