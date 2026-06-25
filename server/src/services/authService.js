const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sessionService = require("./sessionService");
const createError = require("../utils/createError");
const toPublicUser = require("../utils/publicUser");
const {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateAddressLine,
  validateCity,
  validateState,
  validatePostalCode,
  validateCountry,
} = require("../utils/validation");

const addressLabelMaxLength = 50;

const findUserOrFail = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return user;
};

const validateOptionalPhone = (phone) => {
  if (!phone) {
    return "";
  }

  if (typeof phone !== "string") {
    throw createError("Phone number must be text", 400);
  }

  const trimmed = phone.trim();

  if (!trimmed) {
    return "";
  }

  const phoneValidation = validatePhone(trimmed);
  if (!phoneValidation.valid) {
    throw createError(phoneValidation.error, 400);
  }

  return trimmed;
};

const normalizeAddressInput = (addressData = {}) => {
  const label =
    typeof addressData.label === "string" && addressData.label.trim()
      ? addressData.label.trim()
      : "Home";

  if (label.length > addressLabelMaxLength) {
    throw createError(
      `Address label must not exceed ${addressLabelMaxLength} characters`,
      400,
    );
  }

  const validations = [
    validateAddressLine(addressData.addressLine1),
    validateAddressLine(addressData.addressLine2, false),
    validateCity(addressData.city),
    validateState(addressData.state),
    validatePostalCode(addressData.postalCode),
    validateCountry(addressData.country),
  ];

  const failedValidation = validations.find((validation) => !validation.valid);
  if (failedValidation) {
    throw createError(failedValidation.error, 400);
  }

  return {
    label,
    addressLine1: addressData.addressLine1.trim(),
    addressLine2: addressData.addressLine2
      ? addressData.addressLine2.trim()
      : "",
    city: addressData.city.trim(),
    state: addressData.state.trim(),
    postalCode: addressData.postalCode.trim(),
    country: addressData.country.trim(),
    isDefault: Boolean(addressData.isDefault),
  };
};

const ensureSingleDefaultAddress = (addresses) => {
  if (!addresses.length) {
    return;
  }

  let defaultIndex = addresses.findIndex((address) => address.isDefault);

  if (defaultIndex === -1) {
    defaultIndex = 0;
  }

  addresses.forEach((address, index) => {
    address.isDefault = index === defaultIndex;
  });
};

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

    return toPublicUser(user);
  }

  async loginUser(email, password, metadata = {}) {
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

    const tokens = await sessionService.createSession(user, metadata);

    return {
      tokens,
      user: toPublicUser(user),
    };
  }

  async refreshUserSession(refreshToken, metadata = {}) {
    return sessionService.rotateSession(refreshToken, metadata);
  }

  async logoutUser(refreshToken) {
    await sessionService.revokeSession(refreshToken);
  }

  async getMe(userId) {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw createError("User not found", 404);
    }

    return toPublicUser(user);
  }

  async updateProfile(userId, profileData = {}) {
    const nameValidation = validateName(profileData.name);
    if (!nameValidation.valid) {
      throw createError(nameValidation.error, 400);
    }

    const user = await findUserOrFail(userId);

    user.name = profileData.name.trim();
    user.phone = validateOptionalPhone(profileData.phone);

    await user.save();

    return toPublicUser(user);
  }

  async addAddress(userId, addressData = {}) {
    const user = await findUserOrFail(userId);
    const normalizedAddress = normalizeAddressInput(addressData);
    const shouldSetDefault =
      user.addresses.length === 0 || normalizedAddress.isDefault;

    if (shouldSetDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      ...normalizedAddress,
      isDefault: shouldSetDefault,
    });

    ensureSingleDefaultAddress(user.addresses);
    await user.save();

    return toPublicUser(user);
  }

  async updateAddress(userId, addressId, addressData = {}) {
    const user = await findUserOrFail(userId);
    const address = user.addresses.id(addressId);

    if (!address) {
      throw createError("Address not found", 404);
    }

    const normalizedAddress = normalizeAddressInput(addressData);
    const wasDefault = Boolean(address.isDefault);

    address.label = normalizedAddress.label;
    address.addressLine1 = normalizedAddress.addressLine1;
    address.addressLine2 = normalizedAddress.addressLine2;
    address.city = normalizedAddress.city;
    address.state = normalizedAddress.state;
    address.postalCode = normalizedAddress.postalCode;
    address.country = normalizedAddress.country;

    if (normalizedAddress.isDefault || user.addresses.length === 1) {
      user.addresses.forEach((savedAddress) => {
        savedAddress.isDefault = false;
      });
      address.isDefault = true;
    } else if (wasDefault) {
      address.isDefault = false;
      const nextDefault = user.addresses.find(
        (savedAddress) => savedAddress.id !== address.id,
      );

      if (nextDefault) {
        nextDefault.isDefault = true;
      }
    }

    ensureSingleDefaultAddress(user.addresses);
    await user.save();

    return toPublicUser(user);
  }

  async deleteAddress(userId, addressId) {
    const user = await findUserOrFail(userId);
    const address = user.addresses.id(addressId);

    if (!address) {
      throw createError("Address not found", 404);
    }

    const wasDefault = Boolean(address.isDefault);
    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    ensureSingleDefaultAddress(user.addresses);
    await user.save();

    return toPublicUser(user);
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || typeof currentPassword !== "string") {
      throw createError("Current password is required", 400);
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw createError(passwordValidation.error, 400);
    }

    const user = await findUserOrFail(userId);
    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!currentPasswordMatches) {
      throw createError("Current password is incorrect", 401);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await sessionService.revokeUserSessions(user._id, "password-change");
  }
}

module.exports = new AuthService();
