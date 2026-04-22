const Ticket = require("../models/ticketModel");
const { canAccessAnalytics } = require("../security/rbac");
const { ok } = require("../utils/apiResponse");

const getTicketAnalytics = async (req, res, next) => {
  try {
    if (!canAccessAnalytics(req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const analytics = await Ticket.getAnalytics();
    const statusMap = analytics.byStatus.reduce((acc, item) => {
      acc[item.status] = item.total;
      return acc;
    }, {});

    return ok(res, "Ticket analytics fetched", {
      ...analytics,
      summary: {
        pendingTickets: (statusMap.Open || 0) + (statusMap["In Progress"] || 0) + (statusMap.Escalated || 0),
        openTickets: statusMap.Open || 0,
        inProgressTickets: statusMap["In Progress"] || 0,
        resolvedTickets: statusMap.Resolved || 0,
        closedTickets: statusMap.Closed || 0,
        escalatedTickets: statusMap.Escalated || 0
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getTicketAnalytics };
