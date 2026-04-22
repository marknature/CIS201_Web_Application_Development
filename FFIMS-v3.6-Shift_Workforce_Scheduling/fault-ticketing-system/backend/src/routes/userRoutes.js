const express = require("express");
const { getUsers } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin"), getUsers);

module.exports = router;
