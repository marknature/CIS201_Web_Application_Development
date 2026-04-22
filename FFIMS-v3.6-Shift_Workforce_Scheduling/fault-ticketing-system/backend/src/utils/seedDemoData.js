const Comment = require("../models/commentModel");
const { TicketDocument, UserDocument } = require("../models/mongoCollections");
const { createFaultTicket } = require("../services/faultTicketService");
const { notify } = require("../services/notificationService");
const { assignTicket, changeStatus, updatePriority } = require("../services/ticketService");
const { DEFAULT_SERVICE_ACCOUNTS } = require("./serviceAccounts");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const resolveEmail = (value, fallback, allowFallbackDefaults) => {
  const email = normalizeEmail(value);
  if (email) {
    return email;
  }

  return allowFallbackDefaults ? fallback : "";
};

const getSeedUser = async (email) => {
  if (!email) {
    return null;
  }

  const user = await UserDocument.findOne({ email }).lean();
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const DEMO_TICKET_SEEDS = [
  {
    title: "Demo - HVAC temperature alert",
    payload: {
      title: "Demo - HVAC temperature alert",
      description: "The administration block air handling unit is running hotter than normal during peak hours.",
      asset_id: "1",
      category: "Mechanical",
      location: "Administration Block"
    },
    actions: [{ type: "priority", value: "High", performer: "admin" }],
    comment: {
      author: "admin",
      body: "Raised as a watch item while the facilities team checks the air handling unit."
    }
  },
  {
    title: "Demo - Laboratory microscope calibration",
    payload: {
      title: "Demo - Laboratory microscope calibration",
      description: "The optics stage is drifting and needs recalibration before the next lab session.",
      asset_id: "2",
      category: "Laboratory",
      location: "Science Lab 2"
    },
    actions: [
      { type: "priority", value: "Medium", performer: "admin" },
      { type: "assign", performer: "admin" }
    ],
    comment: {
      author: "technician",
      body: "Assigned for a calibration check before the morning practical session."
    }
  },
  {
    title: "Demo - Campus router packet loss",
    payload: {
      title: "Demo - Campus router packet loss",
      description: "Staff are reporting intermittent connectivity and packet loss on the main network router.",
      asset_id: "3",
      category: "ICT",
      location: "Network Operations Room"
    },
    actions: [
      { type: "priority", value: "Critical", performer: "admin" },
      { type: "assign", performer: "admin" },
      { type: "status", value: "In Progress", performer: "technician", role: "technician" }
    ],
    comment: {
      author: "technician",
      body: "Packet drops are being traced on the uplink path and the routing table is under review."
    }
  },
  {
    title: "Demo - Library access panel fault",
    payload: {
      title: "Demo - Library access panel fault",
      description: "The library entrance access panel intermittently rejects valid badges.",
      asset_id: "1",
      category: "Facilities",
      location: "Library Entrance"
    },
    actions: [
      { type: "assign", performer: "admin" },
      { type: "status", value: "In Progress", performer: "technician", role: "technician" },
      {
        type: "status",
        value: "Resolved",
        performer: "technician",
        role: "technician",
        resolutionNotes: "Reset the controller and confirmed badge scans are registering correctly."
      }
    ],
    comment: {
      author: "technician",
      body: "Repair completed and the panel is now passing access checks."
    }
  },
  {
    title: "Demo - Generator fuel gauge replacement",
    payload: {
      title: "Demo - Generator fuel gauge replacement",
      description: "The backup generator fuel gauge is reading erratically and should be replaced.",
      asset_id: "2",
      category: "Mechanical",
      location: "Power House"
    },
    actions: [
      { type: "assign", performer: "admin" },
      { type: "status", value: "In Progress", performer: "technician", role: "technician" },
      {
        type: "status",
        value: "Resolved",
        performer: "technician",
        role: "technician",
        resolutionNotes: "Replaced the gauge sensor and verified the generator readings."
      },
      { type: "status", value: "Closed", performer: "technician", role: "technician" }
    ],
    comment: {
      author: "technician",
      body: "Final inspection is complete and the work order can stay closed."
    }
  },
  {
    title: "Demo - Cafeteria plumbing escalation",
    payload: {
      title: "Demo - Cafeteria plumbing escalation",
      description: "Water is backing up in the cafeteria service area and contractor support is required.",
      asset_id: "3",
      category: "Facilities",
      location: "Cafeteria Block"
    },
    actions: [
      { type: "priority", value: "Critical", performer: "admin" },
      { type: "assign", performer: "admin" },
      { type: "status", value: "Escalated", performer: "admin", role: "admin" }
    ],
    comment: {
      author: "admin",
      body: "Escalated for urgent facilities follow-up and contractor coordination."
    }
  }
];

const applyDemoAction = async ({ ticket, action, actors }) => {
  const performer = actors[action.performer] || actors.admin;

  switch (action.type) {
    case "priority":
      if (ticket.priority !== action.value) {
        ticket = await updatePriority({
          ticketId: ticket.id,
          nextPriority: action.value,
          performedBy: performer.id
        });
      }
      break;
    case "assign":
      ticket = await assignTicket({
        ticketId: ticket.id,
        technicianId: actors.technician.id,
        performedBy: performer.id
      });
      break;
    case "status":
      ticket = await changeStatus({
        ticketId: ticket.id,
        nextStatus: action.value,
        performedBy: performer.id,
        resolutionNotes: action.resolutionNotes,
        role: action.role || performer.role
      });
      break;
    default:
      break;
  }

  return ticket;
};

const seedDemoTicket = async ({ seed, actors }) => {
  const existingTicket = await TicketDocument.findOne({ title: seed.title }).lean();
  if (existingTicket) {
    return {
      created: false,
      ticketId: existingTicket._id.toString(),
      title: seed.title
    };
  }

  const created = await createFaultTicket({
    payload: seed.payload,
    reporterId: actors.reporter.id
  });

  let ticket = created.ticket;
  for (const action of seed.actions || []) {
    ticket = await applyDemoAction({ ticket, action, actors });
  }

  if (seed.comment) {
    const commentAuthor = actors[seed.comment.author] || actors.technician;
    await Comment.create({
      ticket_id: ticket.id,
      fault_id: ticket.fault_id,
      author_id: commentAuthor.id,
      body: seed.comment.body
    });
  }

  return {
    created: true,
    status: ticket.status,
    ticketId: ticket.id,
    title: seed.title
  };
};

const seedDemoData = async ({ allowFallbackDefaults = process.env.NODE_ENV !== "production" } = {}) => {
  const reporterEmail = resolveEmail(process.env.DEMO_USER_EMAIL, DEFAULT_SERVICE_ACCOUNTS.user.email, allowFallbackDefaults);
  const technicianEmail = resolveEmail(
    process.env.TECH_EMAIL,
    DEFAULT_SERVICE_ACCOUNTS.technician.email,
    allowFallbackDefaults
  );
  const adminEmail = resolveEmail(process.env.ADMIN_EMAIL, DEFAULT_SERVICE_ACCOUNTS.admin.email, allowFallbackDefaults);

  if (!reporterEmail || !technicianEmail || !adminEmail) {
    return [];
  }

  const [reporter, technician, admin] = await Promise.all([
    getSeedUser(reporterEmail),
    getSeedUser(technicianEmail),
    getSeedUser(adminEmail)
  ]);

  if (!reporter || !technician || !admin) {
    return [];
  }

  const actors = { reporter, technician, admin };
  const seededTickets = [];

  for (const seed of DEMO_TICKET_SEEDS) {
    seededTickets.push(await seedDemoTicket({ seed, actors }));
  }

  const createdCount = seededTickets.filter((entry) => entry.created).length;
  if (createdCount > 0) {
    await notify(
      admin.id,
      `FFIMS demo data is ready. ${createdCount} live ticket(s) were seeded for local development.`
    );
  }

  return seededTickets;
};

module.exports = { seedDemoData };
