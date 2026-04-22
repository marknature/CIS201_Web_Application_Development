const asyncHandler = require("../../utils/asyncHandler");
const Role = require("../../models/role.model");
const { sendSuccess } = require("../../utils/api-response");

const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ name: 1 });

  sendSuccess(res, {
    message: "Roles retrieved successfully.",
    data: roles.map((role) => ({
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    })),
  });
});

module.exports = { listRoles };
