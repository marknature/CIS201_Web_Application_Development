const express = require("express");
const lookupController = require("./lookup.controller");

const router = express.Router();

router.get("/vehicles", lookupController.listVehicles);
router.get("/assets", lookupController.listAssets);
router.get("/users", lookupController.listUsers);
router.get("/regulations", lookupController.listRegulations);
router.get("/facilities", lookupController.listFacilities);

module.exports = router;
