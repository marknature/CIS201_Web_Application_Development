const express = require("express");
const assetDocumentRoutes = require("../modules/asset-documents/asset-document.routes");
const authRoutes = require("../modules/auth/auth.routes");
const complianceCertificateRoutes = require("../modules/compliance-certificates/compliance-certificate.routes");
const faultTicketRoutes = require("../modules/fault-tickets/fault-ticket.routes");
const maintenanceRoutes = require("../modules/maintenance/maintenance.routes");
const utilitiesRoutes = require("../modules/utilities/utilities.routes");
const userRoutes = require("../modules/users/user.routes");
const vehicleDocumentRoutes = require("../modules/vehicle-documents/vehicle-document.routes");
const fleetRoutes = require("../modules/fleet-management/fleet.routes");
const faultRoutes = require("../modules/fault-ticketing/fault.routes");
const ticketRoutes = require("../modules/fault-ticketing/ticket.routes");
const commentRoutes = require("../modules/fault-ticketing/comment.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");
const auditRoutes = require("../modules/audit/audit.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");
const bookingRoutes = require("../modules/bookings/bookings.routes");

const router = express.Router();
const implementedRoutes = [
  {
    module: "Authentication",
    baseUrl: "/api/auth",
    endpoints: [
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/auth/me",
      "POST /api/auth/change-password",
      "POST /api/auth/request-password-reset",
      "POST /api/auth/reset-password",
    ],
  },
  {
    module: "Users",
    baseUrl: "/api/users",
    endpoints: [
      "POST /api/users",
      "PATCH /api/users/me",
      "PATCH /api/users/:id/status",
      "PATCH /api/users/:id/role",
    ],
  },
  {
    module: "Fault Tickets",
    baseUrl: "/api/fault-tickets",
    endpoints: [
      "GET /api/fault-tickets",
      "GET /api/fault-tickets/:id",
      "POST /api/fault-tickets",
      "PATCH /api/fault-tickets/:id",
      "DELETE /api/fault-tickets/:id",
    ],
  },
  {
    module: "Maintenance",
    baseUrl: "/api/maintenance",
    endpoints: [
      "GET /api/maintenance",
      "GET /api/maintenance/:id",
      "POST /api/maintenance",
      "PATCH /api/maintenance/:id",
      "DELETE /api/maintenance/:id",
      "POST /api/maintenance/from-ticket/:ticketId",
    ],
  },
  {
    module: "Utilities",
    baseUrl: "/api/utilities",
    endpoints: [
      "GET /api/utilities/power-usage",
      "GET /api/utilities/power-usage/:id",
      "GET /api/utilities/power-usage/summary",
      "POST /api/utilities/power-usage",
      "PATCH /api/utilities/power-usage/:id",
      "DELETE /api/utilities/power-usage/:id",
      "GET /api/utilities/water-usage",
      "GET /api/utilities/water-usage/:id",
      "GET /api/utilities/water-usage/summary",
      "POST /api/utilities/water-usage",
      "PATCH /api/utilities/water-usage/:id",
      "DELETE /api/utilities/water-usage/:id",
      "GET /api/utilities/alerts",
      "GET /api/utilities/alerts/:id",
      "GET /api/utilities/alerts/summary",
      "POST /api/utilities/alerts",
      "PATCH /api/utilities/alerts/:id",
      "DELETE /api/utilities/alerts/:id",
      "POST /api/utilities/alerts/:id/create-ticket",
    ],
  },
  {
    module: "Asset Documents",
    baseUrl: "/api/asset-documents",
    endpoints: [
      "GET /api/asset-documents",
      "GET /api/asset-documents/:id",
      "POST /api/asset-documents",
      "PATCH /api/asset-documents/:id",
      "DELETE /api/asset-documents/:id",
    ],
  },
  {
    module: "Compliance Certificates",
    baseUrl: "/api/compliance-certificates",
    endpoints: [
      "GET /api/compliance-certificates",
      "GET /api/compliance-certificates/:id",
      "POST /api/compliance-certificates",
      "PATCH /api/compliance-certificates/:id",
      "DELETE /api/compliance-certificates/:id",
    ],
  },
  {
    module: "Vehicle Documents",
    baseUrl: "/api/vehicle-documents",
    endpoints: [
      "GET /api/vehicle-documents",
      "GET /api/vehicle-documents/:id",
      "POST /api/vehicle-documents",
      "PATCH /api/vehicle-documents/:id",
      "DELETE /api/vehicle-documents/:id",
    ],
  },
  {
    module: "Bookings",
    baseUrl: "/api/bookings",
    endpoints: [
      "GET /api/bookings",
      "GET /api/bookings/:id",
      "POST /api/bookings",
      "PATCH /api/bookings/:id",
      "DELETE /api/bookings/:id",
      "GET /api/bookings/approvals",
      "GET /api/bookings/approvals/:id",
      "POST /api/bookings/approvals",
      "PATCH /api/bookings/approvals/:id",
      "DELETE /api/bookings/approvals/:id",
    ],
  },
  {
    module: "Health",
    baseUrl: "/api/health",
    endpoints: ["GET /api/health"],
  },
];
const plannedModules = [
  {
    module: "API Gateway & Integration Layer",
    plannedBaseUrl: "/api/gateway",
    status: "planned",
  },
  {
    module: "Fleet Management",
    plannedBaseUrl: "/api/fleet",
    status: "planned",
  },
  {
    module: "Asset Register & Lifecycle",
    plannedBaseUrl: "/api/assets",
    status: "planned",
  },
  {
    module: "Inventory & Stores Management",
    plannedBaseUrl: "/api/inventory",
    status: "planned",
  },
  {
    module: "Procurement & Supplier Management",
    plannedBaseUrl: "/api/procurement",
    status: "planned",
  },
  {
    module: "Project Management & Work Coordination",
    plannedBaseUrl: "/api/projects",
    status: "planned",
  },
  {
    module: "Grounds & Facilities Monitoring",
    plannedBaseUrl: "/api/facilities",
    status: "planned",
  },
  {
    module: "Compliance & Safety Management",
    plannedBaseUrl: "/api/compliance",
    status: "partially implemented",
  },
  {
    module: "Shift & Workforce Scheduling",
    plannedBaseUrl: "/api/shifts",
    status: "planned",
  },
  {
    module: "Events & Venue Booking",
    plannedBaseUrl: "/api/bookings",
    status: "implemented",
  },
  {
    module: "Internal Billing & Cost Recovery",
    plannedBaseUrl: "/api/billing",
    status: "planned",
  },
  {
    module: "Dashboards & Executive Views",
    plannedBaseUrl: "/api/dashboards",
    status: "planned",
  },
  {
    module: "Analytics & Reporting",
    plannedBaseUrl: "/api/reports",
    status: "planned",
  },
  {
    module: "Authorisations & Approvals Engine",
    plannedBaseUrl: "/api/approvals",
    status: "planned",
  },
  {
    module: "Notifications & Messaging",
    plannedBaseUrl: "/api/notifications",
    status: "planned",
  },
];

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/fault-tickets", faultTicketRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/utilities", utilitiesRoutes);
router.use("/asset-documents", assetDocumentRoutes);
router.use("/compliance-certificates", complianceCertificateRoutes);
router.use("/vehicle-documents", vehicleDocumentRoutes);
router.use("/bookings", bookingRoutes);

router.get("/", (req, res) => {
  res.json({
    message: "FFIMS API route index.",
    implementedRoutes,
    plannedModules,
  });
});
router.use("/fleet", fleetRoutes);
router.use("/faults", faultRoutes);
router.use("/tickets", ticketRoutes);
router.use("/comments", commentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/audit", auditRoutes);
router.use("/notifications", notificationRoutes);

router.get("/health", (req, res) => {
  res.json({ message: "FFIMS backend is running." });
});

module.exports = router;
