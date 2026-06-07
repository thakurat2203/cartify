/**
 * Frontend validation mirrors the backend rules for immediate user feedback.
 * Keep these constants and error messages aligned with server/src/utils/validation.js.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;
const nameMinLength = 2;
const nameMaxLength = 100;
const productNameMinLength = 2;
const productNameMaxLength = 200;
const categoryMinLength = 1;
const categoryMaxLength = 50;
const descriptionMaxLength = 1000;
const imageUrlMaxLength = 500;
const phoneMinLength = 7;
const phoneMaxLength = 20;
const addressLineMinLength = 5;
const addressLineMaxLength = 200;
const cityMinLength = 2;
const cityMaxLength = 80;
const stateMinLength = 2;
const stateMaxLength = 80;
const postalCodeMinLength = 3;
const postalCodeMaxLength = 20;
const countryMinLength = 2;
const countryMaxLength = 80;
const allowedShippingMethods = ["standard", "express"];

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim();

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < passwordMinLength) {
    return {
      valid: false,
      error: `Password must be at least ${passwordMinLength} characters`,
    };
  }

  return { valid: true };
};

export const validateName = (name) => {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Name is required" };
  }

  const trimmed = name.trim();

  if (trimmed.length < nameMinLength) {
    return {
      valid: false,
      error: `Name must be at least ${nameMinLength} characters`,
    };
  }

  if (trimmed.length > nameMaxLength) {
    return {
      valid: false,
      error: `Name must not exceed ${nameMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateProductName = (name) => {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Product name is required" };
  }

  const trimmed = name.trim();

  if (trimmed.length < productNameMinLength) {
    return {
      valid: false,
      error: `Product name must be at least ${productNameMinLength} characters`,
    };
  }

  if (trimmed.length > productNameMaxLength) {
    return {
      valid: false,
      error: `Product name must not exceed ${productNameMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validatePrice = (price) => {
  if (price === undefined || price === null || price === "") {
    return { valid: false, error: "Price is required" };
  }

  const numPrice = Number(price);

  if (isNaN(numPrice) || numPrice <= 0) {
    return { valid: false, error: "Price must be a positive number" };
  }

  return { valid: true };
};

export const validateStock = (stock) => {
  if (stock === undefined || stock === null || stock === "") {
    return { valid: false, error: "Stock is required" };
  }

  const numStock = Number(stock);

  if (!Number.isInteger(numStock) || numStock < 0) {
    return { valid: false, error: "Stock must be a non-negative integer" };
  }

  return { valid: true };
};

export const validateCategory = (category) => {
  if (!category || typeof category !== "string") {
    return { valid: false, error: "Category is required" };
  }

  const trimmed = category.trim();

  if (trimmed.length < categoryMinLength) {
    return {
      valid: false,
      error: `Category must be at least ${categoryMinLength} character`,
    };
  }

  if (trimmed.length > categoryMaxLength) {
    return {
      valid: false,
      error: `Category must not exceed ${categoryMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateDescription = (description) => {
  if (!description) {
    return { valid: true };
  }

  if (typeof description !== "string") {
    return { valid: false, error: "Description must be text" };
  }

  if (description.length > descriptionMaxLength) {
    return {
      valid: false,
      error: `Description must not exceed ${descriptionMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return { valid: true };
  }

  if (typeof imageUrl !== "string") {
    return { valid: false, error: "Image URL must be text" };
  }

  const trimmed = imageUrl.trim();

  if (trimmed.length > imageUrlMaxLength) {
    return {
      valid: false,
      error: `Image URL must not exceed ${imageUrlMaxLength} characters`,
    };
  }

  try {
    const url = new URL(trimmed);

    if (!["http:", "https:"].includes(url.protocol)) {
      return { valid: false, error: "Image URL must start with http or https" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Image URL must be a valid URL" };
  }
};

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" };
  }

  const trimmed = phone.trim();

  if (trimmed.length < phoneMinLength) {
    return {
      valid: false,
      error: `Phone number must be at least ${phoneMinLength} characters`,
    };
  }

  if (trimmed.length > phoneMaxLength) {
    return {
      valid: false,
      error: `Phone number must not exceed ${phoneMaxLength} characters`,
    };
  }

  if (!/^[0-9+\-\s()]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        "Phone number can only contain numbers, spaces, +, -, and parentheses",
    };
  }

  return { valid: true };
};

export const validateAddressLine = (addressLine, required = true) => {
  if (!addressLine) {
    return required
      ? { valid: false, error: "Address line 1 is required" }
      : { valid: true };
  }

  if (typeof addressLine !== "string") {
    return { valid: false, error: "Address line must be text" };
  }

  const trimmed = addressLine.trim();

  if (required && trimmed.length < addressLineMinLength) {
    return {
      valid: false,
      error: `Address line must be at least ${addressLineMinLength} characters`,
    };
  }

  if (trimmed.length > addressLineMaxLength) {
    return {
      valid: false,
      error: `Address line must not exceed ${addressLineMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateCity = (city) => {
  if (!city || typeof city !== "string") {
    return { valid: false, error: "City is required" };
  }

  const trimmed = city.trim();

  if (trimmed.length < cityMinLength || trimmed.length > cityMaxLength) {
    return {
      valid: false,
      error: `City must be between ${cityMinLength} and ${cityMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateState = (state) => {
  if (!state || typeof state !== "string") {
    return { valid: false, error: "State is required" };
  }

  const trimmed = state.trim();

  if (trimmed.length < stateMinLength || trimmed.length > stateMaxLength) {
    return {
      valid: false,
      error: `State must be between ${stateMinLength} and ${stateMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== "string") {
    return { valid: false, error: "Postal code is required" };
  }

  const trimmed = postalCode.trim();

  if (
    trimmed.length < postalCodeMinLength ||
    trimmed.length > postalCodeMaxLength
  ) {
    return {
      valid: false,
      error: `Postal code must be between ${postalCodeMinLength} and ${postalCodeMaxLength} characters`,
    };
  }

  if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        "Postal code can only contain letters, numbers, spaces, and hyphens",
    };
  }

  return { valid: true };
};

export const validateCountry = (country) => {
  if (!country || typeof country !== "string") {
    return { valid: false, error: "Country is required" };
  }

  const trimmed = country.trim();

  if (trimmed.length < countryMinLength || trimmed.length > countryMaxLength) {
    return {
      valid: false,
      error: `Country must be between ${countryMinLength} and ${countryMaxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateShippingMethod = (shippingMethod) => {
  if (!shippingMethod || typeof shippingMethod !== "string") {
    return { valid: false, error: "Shipping method is required" };
  }

  if (!allowedShippingMethods.includes(shippingMethod)) {
    return { valid: false, error: "Invalid shipping method" };
  }

  return { valid: true };
};
