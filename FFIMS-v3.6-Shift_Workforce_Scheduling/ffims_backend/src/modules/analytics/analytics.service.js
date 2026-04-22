const FaultTicket = require("../../models/fault-ticket.model");

class AnalyticsService {
  /**
   * Get system-wide fault analytics.
   */
  async getFaultAnalytics() {
    const [statusStats, priorityStats, resolutionData] = await Promise.all([
      // Status Distribution
      FaultTicket.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      // Priority Distribution
      FaultTicket.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ]),
      // Resolution Times
      FaultTicket.find({ status: { $in: ["resolved", "closed"] } }, "createdAt resolvedAt")
    ]);

    const totalTickets = statusStats.reduce((acc, curr) => acc + curr.count, 0);

    // Calculate Average Resolution Time in hours
    let totalResolutionTimeMs = 0;
    let resolvedCount = 0;
    resolutionData.forEach(ticket => {
      if (ticket.resolvedAt) {
        totalResolutionTimeMs += (ticket.resolvedAt - ticket.createdAt);
        resolvedCount++;
      }
    });

    const avgResolutionTimeHours = resolvedCount > 0 
      ? (totalResolutionTimeMs / resolvedCount / (1000 * 60 * 60)).toFixed(1)
      : 0;

    return {
      overview: {
        totalTickets,
        avgResolutionTimeHours,
      },
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}

module.exports = new AnalyticsService();
