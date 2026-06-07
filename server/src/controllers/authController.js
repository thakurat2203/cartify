const authService = require("../services/authService");

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
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
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

module.exports = { registerUser, loginUser, getMe };
