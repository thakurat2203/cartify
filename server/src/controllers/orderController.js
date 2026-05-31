const orderService = require("../services/orderService");

// Create order
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingInfo } = req.body;
    const userId = req.user.userId;
    const order = await orderService.createOrder(
      {
        orderItems,
        shippingInfo,
      },
      userId
    );

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

// Get user orders
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await orderService.getMyOrders(userId);
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const order = await orderService.getOrderById(orderId, userId, userRole);
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

// Update status (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);
    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
