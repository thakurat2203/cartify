const orderService = require("../services/orderService");
const { emitOrderStatusUpdated } = require("../socket");

// Order controllers keep route handling thin while services enforce checkout rules.
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingInfo, shippingMethod } = req.body;
    const userId = req.user.userId;

    // Keep pricing decisions in the service by passing the selected method through.
    const order = await orderService.createOrder(
      {
        orderItems,
        shippingInfo,
        shippingMethod,
      },
      userId,
    );

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await orderService.getMyOrders(userId);
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

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

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);

    // Notify live order pages only after MongoDB has saved the new status.
    emitOrderStatusUpdated(order);

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
