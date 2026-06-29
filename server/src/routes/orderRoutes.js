const express = require("express");
const {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// User order routes
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin order routes
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
