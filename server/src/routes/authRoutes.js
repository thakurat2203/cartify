const express = require("express");
const {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshUserSession);
router.post("/logout", logoutUser);

// Protected user routes
router.get("/me", protect, getMe);
router.patch("/me/profile", protect, updateProfile);
router.post("/me/addresses", protect, addAddress);
router.put("/me/addresses/:addressId", protect, updateAddress);
router.delete("/me/addresses/:addressId", protect, deleteAddress);
router.patch("/me/password", protect, updatePassword);

module.exports = router;
