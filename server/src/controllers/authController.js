const authService = require("../services/authService");
const config = require("../config");
const {
  setAuthCookies,
  clearAuthCookies,
} = require("../utils/authCookies");

const getSessionMetadata = (req) => ({
  ip: req.ip,
  userAgent: req.get("user-agent") || "",
});

// Auth controllers keep HTTP response shape separate from service validation.
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(
      email,
      password,
      getSessionMetadata(req),
    );

    setAuthCookies(res, result.tokens);

    res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

const refreshUserSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[config.refreshCookieName];

    const result = await authService.refreshUserSession(
      refreshToken,
      getSessionMetadata(req),
    );

    setAuthCookies(res, result.tokens);

    res.status(200).json({
      message: "Session refreshed successfully",
      user: result.user,
    });
  } catch (err) {
    if (err.statusCode === 401) {
      clearAuthCookies(res);
    }

    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[config.refreshCookieName];

    await authService.logoutUser(refreshToken);
    clearAuthCookies(res);

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getMe(userId);

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.updateProfile(userId, req.body);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.addAddress(userId, req.body);

    res.status(201).json({
      message: "Address added successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.updateAddress(
      userId,
      req.params.addressId,
      req.body,
    );

    res.status(200).json({
      message: "Address updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.deleteAddress(userId, req.params.addressId);

    res.status(200).json({
      message: "Address deleted successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);
    clearAuthCookies(res);

    res.status(200).json({
      message: "Password updated successfully. Please log in again.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
