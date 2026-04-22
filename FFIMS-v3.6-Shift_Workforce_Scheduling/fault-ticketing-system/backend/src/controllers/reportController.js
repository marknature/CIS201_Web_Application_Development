const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const { canAccessAnalytics } = require("../security/rbac");
const { fail, ok } = require("../utils/apiResponse");

const buildTicketSummary = (analytics) => {
  const statusMap = analytics.byStatus.reduce((acc, item) => {
    acc[item.status] = item.total;
    return acc;
  }, {});

  return {
    pendingTickets: (statusMap.Open || 0) + (statusMap["In Progress"] || 0) + (statusMap.Escalated || 0),
    openTickets: statusMap.Open || 0,
    inProgressTickets: statusMap["In Progress"] || 0,
    resolvedTickets: statusMap.Resolved || 0,
    closedTickets: statusMap.Closed || 0,
    escalatedTickets: statusMap.Escalated || 0
  };
};

const getSystemReports = async (req, res, next) => {
  try {
    if (!canAccessAnalytics(req.user)) {
      return fail(res, "Access denied", 403);
    }

    const [ticketAnalytics, roleSummary] = await Promise.all([
      Ticket.getAnalytics(),
      User.getRoleSummary()
    ]);

    return ok(res, "System reports fetched", {
      tickets: {
        ...ticketAnalytics,
        summary: buildTicketSummary(ticketAnalytics)
      },
      users: {
        byRole: roleSummary
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getSystemReports };
