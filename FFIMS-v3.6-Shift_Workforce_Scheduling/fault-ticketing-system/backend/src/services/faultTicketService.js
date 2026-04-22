const Comment = require("../models/commentModel");
const Fault = require("../models/faultModel");
const { DEFAULT_PRIORITY } = require("../models/mongoCollections");
const TicketImage = require("../models/ticketImageModel");
const TicketLog = require("../models/ticketLogModel");
const Ticket = require("../models/ticketModel");
<<<<<<< HEAD
const { fetchAssets } = require("./assetService");
=======
const User = require("../models/userModel");
const { fetchAssets } = require("./assetService");
const { notify } = require("./notificationService");
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29

const findAssetDetails = async (assetId) => {
  const assets = await fetchAssets();
  return assets.find((asset) => String(asset.id) === String(assetId)) || null;
};

const createFaultTicket = async ({ payload, reporterId, files = [] }) => {
  const { title, description, asset_id, category, location } = payload;
  const asset = await findAssetDetails(asset_id);

  if (!asset) {
    const error = new Error("Invalid asset_id from FFIMS asset registry");
    error.statusCode = 400;
    throw error;
  }

  const systemPriority = DEFAULT_PRIORITY;

  const fault = await Fault.create({
    title,
    description,
    asset_id,
    asset_name: asset.name || "",
    category: category || asset.category || "",
    location: location || asset.location || "",
    priority: systemPriority,
    reported_by: reporterId,
    status: "Reported"
  });

  const ticket = await Ticket.create({
    title,
    description,
    fault_id: fault.id,
    asset_id,
    asset_name: asset.name || "",
    category: category || asset.category || "",
    location: location || asset.location || "",
    priority: systemPriority,
    created_by: reporterId,
    maintenance_link: asset.maintenance_link || ""
  });

  await Fault.updateById(fault.id, { ticket_id: ticket.id });

  if (files.length) {
    await TicketImage.createMany(
      ticket.id,
      files.map((file) => file.path)
    );
  }

<<<<<<< HEAD
=======
  const notifyPromise = User.findAdminsAndTechnicians().then((opsStaff) => {
    const notifyOps = opsStaff
      .filter((staff) => String(staff.id) !== String(reporterId))
      .map((staff) =>
        notify(staff.id, `New fault reported: ${title} in ${asset.name || "Asset"}`, ticket.id)
      );
    return Promise.all(notifyOps);
  });

>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  await Promise.all([
    TicketLog.create({
      ticket_id: ticket.id,
      action: "Fault reported and ticket created",
      performed_by: reporterId
    }),
    Comment.create({
      ticket_id: ticket.id,
      fault_id: fault.id,
      author_id: reporterId,
      body: "Initial fault report submitted."
<<<<<<< HEAD
    })
=======
    }),
    notifyPromise
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  ]);

  return {
    fault: await Fault.findById(fault.id),
    ticket
  };
};

module.exports = { createFaultTicket };
