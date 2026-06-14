const express = require("express");
const { handleShoppingAssistant } = require("../controllers/aiController");

const router = express.Router();

router.post("/shopping-assistant", handleShoppingAssistant);

module.exports = router;