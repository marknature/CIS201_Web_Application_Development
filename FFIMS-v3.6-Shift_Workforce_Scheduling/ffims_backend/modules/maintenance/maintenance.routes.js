const express = require("express");
const MaintenanceTask = require("../../models/maintenance-task.model");
const RecurringTask = require("../../models/recurring-task.model");
const MaintenanceHistory = require("../../models/maintenance-history.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Facilities Staff", "Operations Staff", "Fleet Staff", "Technician"];

router.use(
  "/tasks",
  buildCrudRouter({
    Model: MaintenanceTask,
    resourceName: "tasks",
    writeRoles,
    createDefaults: (req) => ({ createdBy: req.user._id }),
    defaultSort: "dateCreated",
  })
);

router.use(
  "/recurring-tasks",
  buildCrudRouter({
    Model: RecurringTask,
    resourceName: "recurring-tasks",
    writeRoles,
    defaultSort: "nextDueDate",
  })
);

router.use(
  "/history",
  buildCrudRouter({
    Model: MaintenanceHistory,
    resourceName: "history-records",
    writeRoles,
    createDefaults: (req) => ({ completedBy: req.user._id }),
    defaultSort: "completedDate",
  })
);

module.exports = router;
