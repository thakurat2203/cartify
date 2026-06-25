const sendErrorResponse = require("../utils/errorResponse");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const createOriginGuard = (allowedOrigins, { exemptPaths = [] } = {}) => {
  const allowedOriginSet = new Set(allowedOrigins);

  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const requestPath = req.originalUrl.split("?")[0];

    if (exemptPaths.includes(requestPath)) {
      next();
      return;
    }

    const origin = req.get("origin");

    if (!origin) {
      sendErrorResponse(res, {
        statusCode: 403,
        message: "Request origin is required",
        code: "ORIGIN_REQUIRED",
      });
      return;
    }

    if (!allowedOriginSet.has(origin)) {
      sendErrorResponse(res, {
        statusCode: 403,
        message: "Request origin is not allowed",
        code: "ORIGIN_NOT_ALLOWED",
      });
      return;
    }

    next();
  };
};

module.exports = createOriginGuard;
