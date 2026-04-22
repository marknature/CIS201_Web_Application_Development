const ROLE_HIERARCHY = { superadmin: 5, admin: 4, 'asset-manager': 3, technician: 2, user: 1 };
const PERMISSIONS = {
  superadmin: { '*': { '*': true } },
  admin: { assets: { create: true, read: true, update: true, delete: true }, documents: { upload: true, read: true }, reports: { generate: true, view: true }, users: { read: true, create: true, update: true }, audit: { view: true } },
  'asset-manager': { assets: { create: true, read: true, update: true, delete: true }, documents: { upload: true, read: true }, reports: { generate: true, view: true }, audit: { view: true } },
  technician: { assets: { read: true, update: true }, documents: { upload: true, read: true }, reports: { view: true } },
  user: { assets: { read: true }, documents: { read: true }, reports: { view: true } }
};
export const hasPermission = (role, action, resource) => { if (!role || !ROLE_HIERARCHY[role]) return false; const rolePerms = PERMISSIONS[role] || {}; if (rolePerms['*'] && rolePerms['*']['*']) return true; return !!(rolePerms[resource] && rolePerms[resource][action]); };
export const requireRole = (...allowedRoles) => (req, res, next) => { if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' }); const userRole = req.user.role; if (!allowedRoles.includes(userRole) && !(userRole === 'superadmin' && allowedRoles.length > 0)) { return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' }); } next(); };
export const requirePermission = (action, resource) => (req, res, next) => { if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' }); const userRole = req.user.role; if (!hasPermission(userRole, action, resource)) { return res.status(403).json({ success: false, message: `Forbidden: Permission '${action}' on '${resource}' denied` }); } next(); };
export const isAdmin = requireRole('admin', 'superadmin');
export const isManager = requireRole('asset-manager', 'admin', 'superadmin');
export const isTechnician = requireRole('technician', 'asset-manager', 'admin', 'superadmin');
export const permit = (...roles) => requireRole(...roles);