const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected user routes
router.get("/me", protect, getMe);

module.exports = router;
