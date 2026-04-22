const ApiError = require("../../utils/apiError");

/**
 * Persona mapping based on the User model roles:
 * - Admin: system_administrator
 * - Technician: transport_manager, facility_manager, supervisor, operational_staff
 * - User: general_university_staff, user
 */

const ROLE_GROUPS = {
  ADMIN: new Set(["system_administrator", "admin"]),
  TECHNICIAN: new Set([
    "transport_manager",
    "facility_manager",
    "supervisor",
    "operational_staff",
    "technician",
  ]),
  USER: new Set(["general_university_staff", "user"]),
};

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const checkRole = (groups) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required."));
  }

  const userRole = normalizeRole(req.user.role);
  const isAllowed = groups.some((group) => ROLE_GROUPS[group].has(userRole));

  if (isAllowed) {
    return next();
  }

  return next(
    new ApiError(403, "Access denied. Insufficient permissions for this operation.")
  );
};

module.exports = {
  isAdmin: checkRole(["ADMIN"]),
  isTechnician: checkRole(["TECHNICIAN", "ADMIN"]), // Admins can do tech work
  isUser: checkRole(["USER", "TECHNICIAN", "ADMIN"]), // Anyone can be a reporter
  isStaff: checkRole(["TECHNICIAN", "ADMIN"]), // Combined view for operational management
};
