const { UserDocument, mapUser, toObjectId } = require("./mongoCollections");
const { normalizeRole } = require("../utils/registrationRoles");

const create = async ({ name, email, password, role }) => {
  const created = await UserDocument.create({
    name,
    email,
    password,
    role: normalizeRole(role, "user")
  });

  return mapUser(created);
};

const findByEmail = async (email) => {
  const user = await UserDocument.findOne({ email: String(email).trim().toLowerCase() }).lean();
  return mapUser(user, { includePassword: true });
};

const findById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return null;
  }

  const user = await UserDocument.findById(objectId).lean();
  return mapUser(user);
};

const listAll = async () => {
  const users = await UserDocument.find({}).sort({ created_at: -1, name: 1 }).lean();
  return users.map((user) => mapUser(user));
};

const findTechnicians = async () => {
  const users = await UserDocument.find({ role: "technician" }).sort({ name: 1 }).lean();
  return users.map((user) => mapUser(user));
};

const listAssignableUsers = async () => {
  const users = await UserDocument.find({ role: "technician" }).sort({ name: 1 }).lean();
  return users.map((user) => mapUser(user));
};

<<<<<<< HEAD
=======
const findAdminsAndTechnicians = async () => {
  const users = await UserDocument.find({ role: { $in: ["admin", "technician"] } }).lean();
  return users.map((user) => mapUser(user));
};

>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
const getRoleSummary = async () => {
  const rows = await UserDocument.aggregate([
    { $group: { _id: "$role", total: { $sum: 1 } } },
    { $project: { _id: 0, role: "$_id", total: 1 } },
    { $sort: { role: 1 } }
  ]);

  return rows;
};

module.exports = {
  create,
  findByEmail,
  findById,
  findTechnicians,
<<<<<<< HEAD
=======
  findAdminsAndTechnicians,
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  getRoleSummary,
  listAll,
  listAssignableUsers
};
