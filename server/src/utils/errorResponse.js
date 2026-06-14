const defaultErrorCodes = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  429: "RATE_LIMITED",
  500: "SERVER_ERROR",
};

const sendErrorResponse = (res, { statusCode, message, code }) => {
  res.status(statusCode).json({
    message,
    error: {
      message,
      status: statusCode,
      code: code || defaultErrorCodes[statusCode] || "SERVER_ERROR",
    },
  });
};

module.exports = sendErrorResponse;
