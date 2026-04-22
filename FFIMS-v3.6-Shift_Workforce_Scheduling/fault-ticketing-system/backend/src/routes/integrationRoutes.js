const express = require("express");
const {
  getCapabilities,
  getOpenApiDocument
} = require("../controllers/integrationController");

const router = express.Router();

router.get("/capabilities", getCapabilities);
router.get("/openapi.json", getOpenApiDocument);

module.exports = router;
