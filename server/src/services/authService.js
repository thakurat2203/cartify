const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const createError = require("../utils/createError");
const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../utils/validation");

class AuthService {
  async registerUser(name, email, password) {
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      throw createError(nameValidation.error, 400);
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw createError(emailValidation.error, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw createError(passwordValidation.error, 400);
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
      throw createError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async loginUser(email, password) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw createError(emailValidation.error, 400);
    }

    if (!password || typeof password !== "string") {
      throw createError("Password is required", 400);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Use one generic response so login cannot reveal whether an email exists.
    if (!user) {
      throw createError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw createError("User not found", 404);
    }
    return user;
  }
}

module.exports = new AuthService();
