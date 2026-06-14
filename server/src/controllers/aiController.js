const aiShoppingAssistantService = require("../services/aiShoppingAssistantService");

const handleShoppingAssistant = async (req, res, next) => {
  try {
    const result = await aiShoppingAssistantService.getRecommendations(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleShoppingAssistant,
};