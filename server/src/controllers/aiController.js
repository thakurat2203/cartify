const aiShoppingAssistantService = require("../services/aiShoppingAssistantService");
const aiCartBuilderService = require("../services/aiCartBuilderService");

const handleShoppingAssistant = async (req, res, next) => {
  try {
    const result = await aiShoppingAssistantService.getRecommendations(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const handleCartBuilder = async (req, res, next) => {
  try {
    const result = await aiCartBuilderService.buildCart(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleShoppingAssistant,
  handleCartBuilder,
};