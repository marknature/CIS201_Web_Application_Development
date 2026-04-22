const express = require("express");
const { body } = require("express-validator");
const { createFault } = require("../controllers/faultController");
const { authenticate } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  upload.array("images", 3),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("asset_id")
      .exists({ checkFalsy: true })
      .bail()
      .customSanitizer((value) => String(value).trim())
      .notEmpty()
      .withMessage("asset_id is required"),
    body("category").optional().isString(),
    body("location").optional().isString(),
    // CRITICAL: Users CANNOT set priority - system will set default
    body("priority").not().exists().withMessage("Users cannot set priority")
  ],
  validateRequest,
  createFault
);

module.exports = router;
