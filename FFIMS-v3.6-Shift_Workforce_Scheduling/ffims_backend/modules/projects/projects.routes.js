const express = require("express");
const Project = require("../../models/project.model");
const ProjectTask = require("../../models/project-task.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Operations Staff", "Facilities Staff"];

router.use(
  "/tasks",
  buildCrudRouter({
    Model: ProjectTask,
    resourceName: "project-tasks",
    writeRoles,
    createDefaults: (req) => ({ createdBy: req.user._id }),
    defaultSort: "createdAt",
  })
);

router.use(
  "/",
  buildCrudRouter({
    Model: Project,
    resourceName: "projects",
    writeRoles,
    createDefaults: (req) => ({ createdBy: req.user._id }),
    defaultSort: "createdAt",
  })
);

module.exports = router;
