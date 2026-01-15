const express = require("express");
const ussdSessionController = require("../controller/ussdSessionController");
const adminAuth = require("../middleware/adminAuth");
const {
  paginationValidation,
  dateRangeValidation,
  validate,
} = require("../middleware/validation");
const { param } = require("express-validator");

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get(
  "/",
  paginationValidation,
  dateRangeValidation,
  ussdSessionController.listSessions
);
router.get("/active", ussdSessionController.getActiveSessions);
router.get(
  "/analytics",
  dateRangeValidation,
  ussdSessionController.getSessionAnalytics
);
router.get(
  "/:sessionId",
  param("sessionId").notEmpty().withMessage("Session ID is required"),
  validate,
  ussdSessionController.getSession
);

module.exports = router;
