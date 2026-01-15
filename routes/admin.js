const express = require("express");
const adminController = require("../controller/adminController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Public routes
router.post("/login", adminController.loginValidation, adminController.login);

// Protected routes
router.get("/me", adminAuth, adminController.getMe);
router.post("/refresh-token", adminAuth, adminController.refreshToken);
router.post("/logout", adminAuth, adminController.logout);

module.exports = router;
