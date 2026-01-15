const express = require("express");
const userManagementController = require("../controller/userManagementController");
const adminAuth = require("../middleware/adminAuth");
const { paginationValidation, validate } = require("../middleware/validation");
const { body, param } = require("express-validator");

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get("/", paginationValidation, userManagementController.listUsers);
router.get(
  "/:id",
  param("id").isInt().withMessage("Invalid user ID"),
  validate,
  userManagementController.getUserById
);
router.get("/:walletId/details", userManagementController.getUserByWalletId);

router.put(
  "/:id",
  param("id").isInt().withMessage("Invalid user ID"),
  validate,
  userManagementController.updateUser
);

router.patch(
  "/:id/status",
  param("id").isInt().withMessage("Invalid user ID"),
  body("accountStatus")
    .isIn(["active", "inactive", "suspended", "blocked"])
    .withMessage("Invalid account status"),
  validate,
  userManagementController.updateUserStatus
);

router.patch(
  "/:id/enable",
  param("id").isInt().withMessage("Invalid user ID"),
  validate,
  userManagementController.enableUser
);

router.patch(
  "/:id/disable",
  param("id").isInt().withMessage("Invalid user ID"),
  validate,
  userManagementController.disableUser
);

router.post(
  "/:id/reset-pin",
  param("id").isInt().withMessage("Invalid user ID"),
  body("newPin")
    .optional()
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage("PIN must be 4 digits"),
  body("generateRandom")
    .optional()
    .isBoolean()
    .withMessage("generateRandom must be boolean"),
  validate,
  userManagementController.resetPin
);

router.get(
  "/:id/transactions",
  param("id").isInt().withMessage("Invalid user ID"),
  validate,
  paginationValidation,
  userManagementController.getUserTransactions
);

router.get(
  "/:id/ussd-sessions",
  param("id").isInt().withMessage("Invalid user ID"),
  validate,
  paginationValidation,
  userManagementController.getUserUssdSessions
);

module.exports = router;
