const { authorizeRoles } = require("../security/rbac");

const authorize = (...roles) => authorizeRoles(...roles);

module.exports = { authorize, authorizeRoles };
