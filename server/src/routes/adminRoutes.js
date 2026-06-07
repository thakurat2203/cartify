const express = require("express");
const { getDashboardStats } = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// Admin dashboard summary route
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardStats);

module.exports = router;
