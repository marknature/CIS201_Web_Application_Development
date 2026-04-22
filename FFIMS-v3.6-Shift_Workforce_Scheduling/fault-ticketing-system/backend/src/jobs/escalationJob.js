const Ticket = require("../models/ticketModel");
const { escalateTicket } = require("../services/ticketService");

const runEscalationJob = async () => {
  const overdue = await Ticket.getOverdueTicketsForEscalation();
  for (const ticket of overdue) {
    await escalateTicket({
      ticketId: ticket.id,
      // Reuse the creator as the actor so the escalation remains attributable
      // without requiring a separate seeded system account.
      performedBy: ticket.created_by
    });
  }
};

const startEscalationJob = () => {
  setInterval(async () => {
    try {
      await runEscalationJob();
    } catch (error) {
      console.error("Escalation job error:", error.message);
    }
  }, 60 * 60 * 1000);
};

module.exports = { startEscalationJob, runEscalationJob };
