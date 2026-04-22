const { DEFAULT_PRIORITY, TicketDocument, TicketImageDocument, TicketLogDocument, mapTicket, toObjectId } = require("./mongoCollections");

const populateTicketUsers = (query) => query.populate("created_by", "name").populate("assigned_to", "name");

const create = async (payload) => {
  const created = await TicketDocument.create({
    title: payload.title,
    description: payload.description,
    fault_id: toObjectId(payload.fault_id),
    asset_id: String(payload.asset_id),
    asset_name: payload.asset_name || "",
    category: payload.category || "",
    location: payload.location || "",
    priority: payload.priority || DEFAULT_PRIORITY,
    status: "Open",
    created_by: toObjectId(payload.created_by),
    due_at: payload.due_at || null,
    maintenance_link: payload.maintenance_link || ""
  });

  return findById(created._id);
};

const findById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return null;
  }

  const ticket = await populateTicketUsers(TicketDocument.findById(objectId)).lean();
  return mapTicket(ticket);
};

const getAll = async ({ status, priority, asset_id, assigned_to, created_by, search, page = 1, limit = 10 }) => {
  const query = {};
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 200);

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (asset_id !== undefined) {
    query.asset_id = String(asset_id);
  }

  if (assigned_to) {
    const objectId = toObjectId(assigned_to);
    if (!objectId) {
      return {
        items: [],
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: 0,
          totalPages: 0
        }
      };
    }

    query.assigned_to = objectId;
  }

  if (created_by) {
    const objectId = toObjectId(created_by);
    if (!objectId) {
      return {
        items: [],
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: 0,
          totalPages: 0
        }
      };
    }

    query.created_by = objectId;
  }

  if (search) {
    const pattern = new RegExp(String(search).trim(), "i");
    query.$or = [
      { title: pattern },
      { description: pattern },
      { asset_name: pattern },
      { category: pattern },
      { location: pattern }
    ];
  }

  const [total, tickets] = await Promise.all([
    TicketDocument.countDocuments(query),
    populateTicketUsers(
      TicketDocument.find(query)
        .sort({ created_at: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
    ).lean()
  ]);

  return {
    items: tickets.map((ticket) => mapTicket(ticket)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit)
    }
  };
};

const updateById = async (id, data) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return null;
  }

  const updateData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (key === "assigned_to" || key === "fault_id") {
      updateData[key] = value ? toObjectId(value) : null;
      continue;
    }

    if (key === "asset_id") {
      updateData.asset_id = String(value);
      continue;
    }

    updateData[key] = value;
  }

  if (!Object.keys(updateData).length) {
    return findById(id);
  }

  const updated = await populateTicketUsers(
    TicketDocument.findByIdAndUpdate(objectId, updateData, {
      returnDocument: "after",
      runValidators: true
    })
  ).lean();

  return mapTicket(updated);
};

const removeById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return false;
  }

  const deleted = await TicketDocument.findByIdAndDelete(objectId).lean();
  if (!deleted) {
    return false;
  }

  await Promise.all([TicketImageDocument.deleteMany({ ticket_id: objectId }), TicketLogDocument.deleteMany({ ticket_id: objectId })]);

  return true;
};

const getOverdueTicketsForEscalation = async () => {
  const now = Date.now();
  const criticalThreshold = new Date(now - 12 * 60 * 60 * 1000);
  const highThreshold = new Date(now - 24 * 60 * 60 * 1000);

  const tickets = await TicketDocument.find({
    status: { $in: ["Open", "Assigned", "In Progress"] },
    $or: [
      { priority: "Critical", created_at: { $lte: criticalThreshold } },
      { priority: "High", created_at: { $lte: highThreshold } }
    ]
  }).lean();

  return tickets.map((ticket) => mapTicket(ticket));
};

const getAnalytics = async () => {
  const [statusRows, priorityRows, avgRows] = await Promise.all([
    TicketDocument.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", total: 1 } },
      { $sort: { status: 1 } }
    ]),
    TicketDocument.aggregate([
      { $group: { _id: "$priority", total: { $sum: 1 } } },
      { $project: { _id: 0, priority: "$_id", total: 1 } },
      { $sort: { priority: 1 } }
    ]),
    TicketDocument.aggregate([
      { $match: { resolved_at: { $ne: null } } },
      {
        $project: {
          resolution_minutes: {
            $divide: [{ $subtract: ["$resolved_at", "$created_at"] }, 60 * 1000]
          }
        }
      },
      {
        $group: {
          _id: null,
          avg_resolution_minutes: { $avg: "$resolution_minutes" }
        }
      }
    ])
  ]);

  return {
    byStatus: statusRows,
    byPriority: priorityRows,
    averageResolutionMinutes: Number((avgRows[0]?.avg_resolution_minutes || 0).toFixed?.(2) || 0)
  };
};

module.exports = {
  create,
  findById,
  getAll,
  getAnalytics,
  getOverdueTicketsForEscalation,
  removeById,
  updateById
};
