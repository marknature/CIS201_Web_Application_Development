const ROLE_ALIASES = Object.freeze({
  admin: "admin",
  technician: "technician",
  user: "user"
});

const STORED_ROLES = Object.freeze(Object.keys(ROLE_ALIASES));
const SYSTEM_ROLES = Object.freeze(["admin", "technician", "user"]);
const PUBLIC_REGISTRATION_ROLES = Object.freeze(["user"]);
const DEFAULT_PUBLIC_ROLE = "user";

const normalizeRole = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  return ROLE_ALIASES[normalized] || fallback;
};

const normalizePublicRole = (value) => normalizeRole(value, DEFAULT_PUBLIC_ROLE);

const isPrivilegedRole = (value) => ["admin", "technician"].includes(normalizeRole(value));

module.exports = {
  DEFAULT_PUBLIC_ROLE,
  PUBLIC_REGISTRATION_ROLES,
  ROLE_ALIASES,
  STORED_ROLES,
  SYSTEM_ROLES,
  isPrivilegedRole,
  normalizePublicRole,
  normalizeRole
};
