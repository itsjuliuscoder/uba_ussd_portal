const express = require("express");
const transactionController = require("../controller/transactionController");
const adminAuth = require("../middleware/adminAuth");
const {
  paginationValidation,
  dateRangeValidation,
  validate,
} = require("../middleware/validation");
const { param, body } = require("express-validator");

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get(
  "/",
  paginationValidation,
  dateRangeValidation,
  transactionController.listTransactions
);
router.get(
  "/summary",
  dateRangeValidation,
  transactionController.getTransactionSummary
);
router.get(
  "/airtime-data",
  paginationValidation,
  dateRangeValidation,
  transactionController.listAirtimeDataTransactions
);
router.get(
  "/cardless",
  paginationValidation,
  dateRangeValidation,
  transactionController.listCardlessTransactions
);
router.get(
  "/:id",
  param("id").isInt().withMessage("Invalid transaction ID"),
  validate,
  transactionController.getTransaction
);

router.post("/export", transactionController.exportTransactions);

router.patch(
  "/:id/status",
  param("id").isInt().withMessage("Invalid transaction ID"),
  body("status").optional().isString(),
  body("statusCode").optional().isString(),
  body("statusMessage").optional().isString(),
  validate,
  transactionController.updateTransactionStatus
);

module.exports = router;
