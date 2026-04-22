const Notification = require("../../models/notification.model");
const { buildCrudRouter } = require("../common/crud-router");
const ApiError = require("../../utils/apiError");

module.exports = buildCrudRouter({
  Model: Notification,
  resourceName: "notifications",
  writeRoles: ["Admin", "Operations Staff", "Facilities Staff"],
  listFilter: (query, req) => {
    if (req.user.role !== "Admin") {
      return { ...query, recipientId: req.user._id };
    }
    return query;
  },
  createDefaults: (req) => ({ createdBy: req.user._id }),
  updateGuard: async (existing, req) => {
    if (req.user.role !== "Admin" && String(existing.recipientId) !== String(req.user._id)) {
      throw new ApiError(403, "You do not have permission to update this notification.");
    }
  },
  defaultSort: "createdAt",
});
