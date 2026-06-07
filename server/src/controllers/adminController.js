const adminService = require("../services/adminService");

// Admin controllers return aggregated data prepared by the admin service.
const getDashboardStats = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboardStats();

    res.status(200).json({
      dashboard,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
};
