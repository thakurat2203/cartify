/**
 * Centralized validation utilities for frontend
 * These must match the backend validation rules exactly
 */

// Validation constants and patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;
const nameMinLength = 2;
const nameMaxLength = 100;
const productNameMinLength = 2;
const productNameMaxLength = 200;
const categoryMinLength = 1;
const categoryMaxLength = 50;
const descriptionMaxLength = 1000;
const addressMinLength = 10;
const addressMaxLength = 500;

// Checks if email is present and follows correct format
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

// Ensures password meets minimum length requirements
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

// Validates user name length
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

// Validates product name length
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

// Ensures price is a positive number
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

// Ensures stock is a non-negative integer
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

// Validates category name length
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

// Validates description length if provided (optional field)
export const validateDescription = (description) => {
  if (!description) {
    return { valid: true }; // Optional field
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

// Validates shipping address length
export const validateAddress = (address) => {
  if (!address || typeof address !== "string") {
    return { valid: false, error: "Address is required" };
  }
  const trimmed = address.trim();
  if (trimmed.length < addressMinLength) {
    return {
      valid: false,
      error: `Address must be at least ${addressMinLength} characters`,
    };
  }
  if (trimmed.length > addressMaxLength) {
    return {
      valid: false,
      error: `Address must not exceed ${addressMaxLength} characters`,
    };
  }
  return { valid: true };
};
