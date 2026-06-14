const sendErrorResponse = require("../utils/errorResponse");

const notFound = (req, res, next) => {
  sendErrorResponse(res, {
    statusCode: 404,
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
};

module.exports = notFound;
