const jwt = require("jsonwebtoken");
const config = require("../config");
const sendErrorResponse = require("../utils/errorResponse");

// Attach the verified JWT claims used by downstream controllers and role checks.
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendErrorResponse(res, {
        statusCode: 401,
        message: "Not authorized, token missing",
        code: "AUTH_TOKEN_MISSING",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    sendErrorResponse(res, {
      statusCode: 401,
      message: "Not authorized, token invalid",
      code: "AUTH_TOKEN_INVALID",
    });
  }
};

// Keep route-level authorization explicit beside each protected admin endpoint.
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendErrorResponse(res, {
        statusCode: 403,
        message: "Forbidden: insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
      return;
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
