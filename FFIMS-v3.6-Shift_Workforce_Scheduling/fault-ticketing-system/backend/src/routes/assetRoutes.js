const express = require("express");
const { getAssets } = require("../controllers/assetController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getAssets);

module.exports = router;
