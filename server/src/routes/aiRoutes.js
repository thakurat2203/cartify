const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  handleShoppingAssistant,
  handleCartBuilder,
} = require("../controllers/aiController");
const sendErrorResponse = require("../utils/errorResponse");

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  handler: (req, res) => {
    sendErrorResponse(res, {
      statusCode: 429,
      message: "Too many AI requests, please try again later",
      code: "AI_RATE_LIMITED",
    });
  },
});

router.post("/shopping-assistant", aiLimiter, handleShoppingAssistant);

router.post(
  "/cart-builder",
  aiLimiter,
  handleCartBuilder,
);

module.exports = router;
