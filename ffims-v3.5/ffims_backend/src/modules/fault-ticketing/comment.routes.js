const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const controller = require("./fault-ticketing.controller");
const { validateCreateComment } = require("./fault-ticketing.validation");

const router = express.Router();

router.post("/", authenticateToken, validate(validateCreateComment), controller.createComment);

module.exports = router;
