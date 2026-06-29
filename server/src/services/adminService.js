const Order = require("../models/Order");
const Product = require("../models/Product");
require("../models/User");

const lowStockThreshold = 10;
const activeOrderStatuses = ["placed", "processing", "shipped"];
const orderStatuses = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

class AdminService {
  async getDashboardStats() {
    // Fetch dashboard widgets in parallel because each query is independent.
    const [
      totalProducts,
      totalOrders,
      revenueResult,
      activeOrders,
      lowStockCount,
      outOfStockCount,
      ordersByStatusResult,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),

      // Failed payment expiries become cancelled, so they must not count as revenue.
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]),

      Order.countDocuments({
        status: { $in: activeOrderStatuses },
      }),

      Product.countDocuments({
        stock: { $gt: 0, $lte: lowStockThreshold },
      }),

      Product.countDocuments({
        stock: 0,
      }),

      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Order.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(5),

      // Dashboard preview only; full filtering will live on admin products page.
      Product.find({
        stock: { $gt: 0, $lte: lowStockThreshold },
      })
        .sort({ stock: 1, name: 1 })
        .limit(5)
        .select("name price stock category image"),

      Product.find({
        stock: 0,
      })
        .sort({ name: 1 })
        .limit(5)
        .select("name price stock category image"),
    ]);

    const ordersByStatus = orderStatuses.reduce((summary, status) => {
      summary[status] = 0;
      return summary;
    }, {});

    ordersByStatusResult.forEach((item) => {
      ordersByStatus[item._id] = item.count;
    });

    return {
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      activeOrders,
      lowStockCount,
      outOfStockCount,
      lowStockThreshold,
      ordersByStatus,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
    };
  }
}

module.exports = new AdminService();
