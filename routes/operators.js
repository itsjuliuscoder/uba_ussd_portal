const express = require("express");
const operatorController = require("../controller/operatorController");
const adminAuth = require("../middleware/adminAuth");
const { validate } = require("../middleware/validation");
const { body, param } = require("express-validator");

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

router.get("/", operatorController.listOperators);
router.get(
  "/:id",
  param("id").isInt().withMessage("Invalid operator ID"),
  validate,
  operatorController.getOperator
);

router.post(
  "/",
  body("name").notEmpty().withMessage("Name is required"),
  body("network_id").isInt().withMessage("Network ID must be an integer"),
  body("country").notEmpty().withMessage("Country is required"),
  body("status").optional().isBoolean().withMessage("Status must be boolean"),
  validate,
  operatorController.createOperator
);

router.put(
  "/:id",
  param("id").isInt().withMessage("Invalid operator ID"),
  validate,
  operatorController.updateOperator
);

router.delete(
  "/:id",
  param("id").isInt().withMessage("Invalid operator ID"),
  validate,
  operatorController.deleteOperator
);

router.patch(
  "/:id/status",
  param("id").isInt().withMessage("Invalid operator ID"),
  body("status").optional().isBoolean().withMessage("Status must be boolean"),
  validate,
  operatorController.toggleOperatorStatus
);

module.exports = router;
