const sendErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";
  let code;

  if (err.name === "CastError") {
    // Normalize invalid MongoDB ObjectId errors into a client-friendly response.
    statusCode = 400;
    message = "Invalid resource id";
    code = "INVALID_RESOURCE_ID";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
    code = "DUPLICATE_FIELD_VALUE";
  }

  sendErrorResponse(res, {
    statusCode,
    message,
    code,
  });
};

module.exports = errorHandler;
