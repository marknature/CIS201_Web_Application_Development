const { ADMIN_OVERRIDE_STATUSES, MANUAL_STATUSES } = require("../utils/ticketWorkflow");
const { SYSTEM_ROLES } = require("../utils/registrationRoles");

const ROLE = Object.freeze({
  USER: "user",
  TECHNICIAN: "technician",
  ADMIN: "admin"
});

const OPERATIONAL_ROLES = Object.freeze([ROLE.TECHNICIAN, ROLE.ADMIN]);
const ADMIN_ROLES = Object.freeze([ROLE.ADMIN]);
const PRIORITY_OPTIONS = Object.freeze(["Low", "Medium", "High", "Critical"]);

const hasRole = (user, roles = []) => Boolean(user?.role && roles.includes(user.role));
const isOperationalUser = (user) => hasRole(user, OPERATIONAL_ROLES);
const isAdminUser = (user) => hasRole(user, ADMIN_ROLES);

const authorizeRoles = (...roles) => {
  const allowedRoles = roles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return next();
  };
};

const buildOwnTicketFilter = (user, filters = {}) => {
  const scopedFilters = { ...filters };
  delete scopedFilters.created_by;
  scopedFilters.created_by = user.id;
  return scopedFilters;
};

const buildVisibleTicketFilter = (user, filters = {}) => {
  if (isOperationalUser(user)) {
    return { ...filters };
  }

  return buildOwnTicketFilter(user, filters);
};

const canViewTicket = (user, ticket) => {
  if (!user || !ticket) {
    return false;
  }

  return isOperationalUser(user) || ticket.created_by === user.id;
};

const canCreateTicket = (user) => Boolean(user?.role);
const canViewTicketList = (user) => Boolean(user?.role);
const canViewAllTickets = (user) => isOperationalUser(user);
const canManageTicket = (user) => isOperationalUser(user);
const canDeleteTicket = (user) => isAdminUser(user);
const canCommentOnTicket = (user) => isOperationalUser(user);
const canAccessAnalytics = (user) => isAdminUser(user);
const canAccessUserManagement = (user) => isAdminUser(user);
const canAssignTicket = (user) => isOperationalUser(user);
const canSetTicketPriority = (user) => isOperationalUser(user);
const canUpdateTicketPriority = (user) => isOperationalUser(user);
const canUpdateTicketStatus = (user) => isOperationalUser(user);

const canAssignToRole = (assignerRole, targetRole) =>
  OPERATIONAL_ROLES.includes(assignerRole) && targetRole === ROLE.TECHNICIAN;

const getEditableTicketFields = (role) => {
  if (role === ROLE.ADMIN) {
    return ["title", "description", "category", "location", "resolution_notes", "due_at", "maintenance_link"];
  }

  if (role === ROLE.TECHNICIAN) {
    return ["resolution_notes"];
  }

  return [];
};

const getCreatableTicketFields = () => ["title", "description", "asset_id", "category", "location"];

const getAllowedPriorities = (role) => (OPERATIONAL_ROLES.includes(role) ? [...PRIORITY_OPTIONS] : []);

const getAllowedStatusTransitions = (role) => {
  if (role === ROLE.ADMIN) {
    return [...ADMIN_OVERRIDE_STATUSES];
  }

  if (role === ROLE.TECHNICIAN) {
    return [...MANUAL_STATUSES];
  }

  return [];
};

module.exports = {
  ADMIN_ROLES,
  OPERATIONAL_ROLES,
  PRIORITY_OPTIONS,
  ROLE,
  SYSTEM_ROLES,
  authorizeRoles,
  buildOwnTicketFilter,
  buildVisibleTicketFilter,
  canAccessAnalytics,
  canAccessUserManagement,
  canAssignTicket,
  canAssignToRole,
  canCommentOnTicket,
  canCreateTicket,
  canDeleteTicket,
  canManageTicket,
  canSetTicketPriority,
  canUpdateTicketPriority,
  canUpdateTicketStatus,
  canViewAllTickets,
  canViewTicket,
  canViewTicketList,
  getAllowedPriorities,
  getAllowedStatusTransitions,
  getCreatableTicketFields,
  getEditableTicketFields,
  hasRole,
  isAdminUser,
  isOperationalUser
};
