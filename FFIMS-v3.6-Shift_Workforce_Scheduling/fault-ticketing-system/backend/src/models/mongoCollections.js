const { mongoose } = require("../config/db");
const { SYSTEM_ROLES, normalizeRole } = require("../utils/registrationRoles");

const { Schema, Types, model, models } = mongoose;

const PRIORITIES = Object.freeze(["Low", "Medium", "High", "Critical"]);
const DEFAULT_PRIORITY = "Low";
const TICKET_STATUSES = Object.freeze(["Open", "Assigned", "In Progress", "Resolved", "Closed", "Escalated"]);
const FAULT_STATUSES = Object.freeze(["Reported", "Triaged", "In Progress", "Resolved", "Closed", "Escalated"]);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: SYSTEM_ROLES,
      default: "user"
    }
  },
  {
    collection: "users",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

const faultSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    asset_id: { type: String, required: true, trim: true },
    asset_name: { type: String, default: "" },
    category: { type: String, default: "" },
    location: { type: String, default: "" },
    priority: {
      type: String,
      required: true,
      enum: PRIORITIES,
      default: DEFAULT_PRIORITY
    },
    status: {
      type: String,
      required: true,
      enum: FAULT_STATUSES,
      default: "Reported"
    },
    reported_by: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", default: null, index: true }
  },
  {
    collection: "faults",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
    versionKey: false
  }
);

const ticketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    fault_id: { type: Schema.Types.ObjectId, ref: "Fault", required: true, index: true },
    asset_id: { type: String, required: true, trim: true },
    asset_name: { type: String, default: "" },
    category: { type: String, default: "" },
    location: { type: String, default: "" },
    priority: {
      type: String,
      required: true,
      enum: PRIORITIES,
      default: DEFAULT_PRIORITY
    },
    status: {
      type: String,
      required: true,
      enum: TICKET_STATUSES,
      default: "Open"
    },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assigned_to: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    due_at: { type: Date, default: null },
    maintenance_link: { type: String, default: "" },
    resolution_notes: { type: String, default: "" },
    resolved_at: { type: Date, default: null }
  },
  {
    collection: "tickets",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
    versionKey: false
  }
);

const commentSchema = new Schema(
  {
    ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    fault_id: { type: Schema.Types.ObjectId, ref: "Fault", default: null, index: true },
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, trim: true }
  },
  {
    collection: "comments",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

const ticketImageSchema = new Schema(
  {
    ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    file_path: { type: String, required: true }
  },
  {
    collection: "ticket_images",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

const ticketLogSchema = new Schema(
  {
    ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    action: { type: String, required: true },
    performed_by: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timestamp: { type: Date, default: Date.now }
  },
  {
    collection: "ticket_logs",
    versionKey: false
  }
);

const notificationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", default: null, index: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false }
  },
  {
    collection: "notifications",
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    },
    versionKey: false
  }
);

const UserDocument = models.User || model("User", userSchema);
const FaultDocument = models.Fault || model("Fault", faultSchema);
const TicketDocument = models.Ticket || model("Ticket", ticketSchema);
const CommentDocument = models.Comment || model("Comment", commentSchema);
const TicketImageDocument = models.TicketImage || model("TicketImage", ticketImageSchema);
const TicketLogDocument = models.TicketLog || model("TicketLog", ticketLogSchema);
const NotificationDocument = models.Notification || model("Notification", notificationSchema);

const isValidObjectId = (value) => Types.ObjectId.isValid(value);

const toObjectId = (value) => {
  if (!value || !isValidObjectId(value)) {
    return null;
  }

  return new Types.ObjectId(value);
};

const toId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (value._id) {
    return value._id.toString();
  }

  if (value.id) {
    return value.id.toString();
  }

  return String(value);
};

const mapUser = (user, { includePassword = false } = {}) => {
  if (!user) {
    return null;
  }

  const obj = typeof user.toObject === "function" ? user.toObject() : user;
  const mapped = {
    id: toId(obj._id || obj.id),
    name: obj.name,
    email: obj.email,
    role: normalizeRole(obj.role, "user"),
    created_at: obj.created_at || null
  };

  if (includePassword) {
    mapped.password = obj.password;
  }

  return mapped;
};

const mapFault = (fault) => {
  if (!fault) {
    return null;
  }

  const obj = typeof fault.toObject === "function" ? fault.toObject() : fault;
  const reporter = obj.reported_by && typeof obj.reported_by === "object" && obj.reported_by.name ? obj.reported_by : null;

  return {
    id: toId(obj._id || obj.id),
    title: obj.title,
    description: obj.description,
    asset_id: obj.asset_id,
    asset_name: obj.asset_name || "",
    category: obj.category || "",
    location: obj.location || "",
    priority: obj.priority,
    status: obj.status,
    reported_by: toId(reporter?._id || obj.reported_by),
    reporter_name: reporter?.name || null,
    ticket_id: toId(obj.ticket_id),
    created_at: obj.created_at || null,
    updated_at: obj.updated_at || null
  };
};

const mapTicket = (ticket) => {
  if (!ticket) {
    return null;
  }

  const obj = typeof ticket.toObject === "function" ? ticket.toObject() : ticket;
  const creator = obj.created_by && typeof obj.created_by === "object" && obj.created_by.name ? obj.created_by : null;
  const assignee = obj.assigned_to && typeof obj.assigned_to === "object" && obj.assigned_to.name ? obj.assigned_to : null;

  return {
    id: toId(obj._id || obj.id),
    title: obj.title,
    description: obj.description,
    fault_id: toId(obj.fault_id),
    asset_id: obj.asset_id,
    asset_name: obj.asset_name || "",
    category: obj.category || "",
    location: obj.location || "",
    priority: obj.priority,
    status: obj.status,
    created_by: toId(creator?._id || obj.created_by),
    assigned_to: toId(assignee?._id || obj.assigned_to),
    creator_name: creator?.name || null,
    assignee_name: assignee?.name || null,
    due_at: obj.due_at || null,
    maintenance_link: obj.maintenance_link || "",
    resolution_notes: obj.resolution_notes || "",
    resolved_at: obj.resolved_at || null,
    created_at: obj.created_at || null,
    updated_at: obj.updated_at || null
  };
};

const mapComment = (comment) => {
  if (!comment) {
    return null;
  }

  const obj = typeof comment.toObject === "function" ? comment.toObject() : comment;
  const author = obj.author_id && typeof obj.author_id === "object" && obj.author_id.name ? obj.author_id : null;

  return {
    id: toId(obj._id || obj.id),
    ticket_id: toId(obj.ticket_id),
    fault_id: toId(obj.fault_id),
    author_id: toId(author?._id || obj.author_id),
    author_name: author?.name || null,
    body: obj.body,
    created_at: obj.created_at || null
  };
};

const mapTicketLog = (log) => {
  if (!log) {
    return null;
  }

  const obj = typeof log.toObject === "function" ? log.toObject() : log;
  const performer = obj.performed_by && typeof obj.performed_by === "object" && obj.performed_by.name ? obj.performed_by : null;

  return {
    id: toId(obj._id || obj.id),
    ticket_id: toId(obj.ticket_id),
    action: obj.action,
    performed_by: toId(performer?._id || obj.performed_by),
    performed_by_name: performer?.name || obj.performed_by_name || null,
    timestamp: obj.timestamp || null
  };
};

const mapTicketImage = (image) => {
  if (!image) {
    return null;
  }

  const obj = typeof image.toObject === "function" ? image.toObject() : image;
  return {
    id: toId(obj._id || obj.id),
    ticket_id: toId(obj.ticket_id),
    file_path: obj.file_path,
    created_at: obj.created_at || null
  };
};

const mapNotification = (notification) => {
  if (!notification) {
    return null;
  }

  const obj = typeof notification.toObject === "function" ? notification.toObject() : notification;
  return {
    id: toId(obj._id || obj.id),
    user_id: toId(obj.user_id),
    ticket_id: toId(obj.ticket_id),
    message: obj.message,
    is_read: Boolean(obj.is_read),
    created_at: obj.created_at || null
  };
};

module.exports = {
  CommentDocument,
  FAULT_STATUSES,
  FaultDocument,
  NotificationDocument,
  DEFAULT_PRIORITY,
  PRIORITIES,
  TICKET_STATUSES,
  TicketDocument,
  TicketImageDocument,
  TicketLogDocument,
  UserDocument,
  isValidObjectId,
  mapComment,
  mapFault,
  mapNotification,
  mapTicket,
  mapTicketImage,
  mapTicketLog,
  mapUser,
  toObjectId
};
