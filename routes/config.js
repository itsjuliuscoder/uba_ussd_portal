const express = require("express");
const configController = require("../controller/configController");
const adminAuth = require("../middleware/adminAuth");
const { validate } = require("../middleware/validation");
const { body } = require("express-validator");

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get("/", configController.getConfig);
router.put("/", configController.updateConfig);
router.get("/menu-text", configController.getMenuText);
router.put(
  "/menu-text",
  body("language")
    .isIn(["en", "fr"])
    .withMessage('Language must be either "en" or "fr"'),
  body("menuText").notEmpty().withMessage("Menu text is required"),
  validate,
  configController.updateMenuText
);

module.exports = router;
