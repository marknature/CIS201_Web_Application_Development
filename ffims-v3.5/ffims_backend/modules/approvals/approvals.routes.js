const ApprovalRequest = require("../../models/approval-request.model");
const { buildCrudRouter } = require("../common/crud-router");

module.exports = buildCrudRouter({
  Model: ApprovalRequest,
  resourceName: "approval-requests",
  writeRoles: ["Admin", "Operations Staff", "Approver"],
  createDefaults: (req) => ({ requestedBy: req.user._id }),
  defaultSort: "requestedAt",
});
