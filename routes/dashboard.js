const express = require("express");
const dashboardController = require("../controller/dashboardController");
const adminAuth = require("../middleware/adminAuth");
const {
  paginationValidation,
  dateRangeValidation,
} = require("../middleware/validation");

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get("/stats", dateRangeValidation, dashboardController.getStats);
router.get(
  "/transactions-summary",
  dateRangeValidation,
  dashboardController.getTransactionsSummary
);
router.get("/user-growth", dashboardController.getUserGrowth);
router.get("/revenue", dashboardController.getRevenue);
router.get(
  "/ussd-sessions",
  dateRangeValidation,
  dashboardController.getUssdSessions
);

module.exports = router;
