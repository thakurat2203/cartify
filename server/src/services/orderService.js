const Order = require("../models/Order");
const Product = require("../models/Product");
const createError = require("../utils/createError");
const {
  validateEmail,
  validateName,
  validateAddress,
} = require("../utils/validation");

class OrderService {
  // Create order
  async createOrder(orderData, userId) {
    const { orderItems, shippingInfo } = orderData;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw createError("Order items are required", 400);
    }

    if (!shippingInfo) {
      throw createError("Shipping information is required", 400);
    }

    const nameValidation = validateName(shippingInfo.fullName);
    if (!nameValidation.valid) {
      throw createError(nameValidation.error, 400);
    }

    const emailValidation = validateEmail(shippingInfo.email);
    if (!emailValidation.valid) {
      throw createError(emailValidation.error, 400);
    }

    const addressValidation = validateAddress(shippingInfo.address);
    if (!addressValidation.valid) {
      throw createError(addressValidation.error, 400);
    }

    // Keep only product id and quantity from the frontend.
    const normalizedOrderItems = orderItems.map((item) => ({
      product: item.product ? item.product.toString() : "",
      quantity: Number(item.quantity),
    }));

    // Validate each cart item before using it.
    for (const item of normalizedOrderItems) {
      if (!item.product) {
        throw createError("Product id is required", 400);
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw createError("Quantity must be a positive integer", 400);
      }
    }

    // Merge duplicate products before stock checks.
    const productQuantityMap = new Map();
    for (const item of normalizedOrderItems) {
      productQuantityMap.set(
        item.product,
        (productQuantityMap.get(item.product) || 0) + item.quantity,
      );
    }

    const mergedOrderItems = Array.from(
      productQuantityMap,
      ([product, quantity]) => ({ product, quantity }),
    );

    // Fetch real product data so browser prices cannot be trusted.
    const productIds = mergedOrderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // Build order items using database name and price.
    const safeOrderItems = mergedOrderItems.map((item) => {
      const product = productMap.get(item.product.toString());

      if (!product) {
        throw createError("Product not found", 404);
      }

      if (product.stock < item.quantity) {
        throw createError(
          `Only ${product.stock} items available for ${product.name}`,
          400,
        );
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    // Calculate totals on the backend.
    const calculatedTotalItems = safeOrderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const calculatedTotalPrice = safeOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      user: userId,
      orderItems: safeOrderItems,
      shippingInfo: {
        fullName: shippingInfo.fullName.trim(),
        email: shippingInfo.email.trim().toLowerCase(),
        address: shippingInfo.address.trim(),
      },
      totalItems: calculatedTotalItems,
      totalPrice: calculatedTotalPrice,
    });

    await Product.bulkWrite(
      safeOrderItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } },
        },
      })),
    );

    return order;
  }

  // Get user orders
  async getMyOrders(userId) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  // Get order by ID
  async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (userRole !== "admin" && order.user.toString() !== userId) {
      throw createError("Forbidden: not your order", 403);
    }

    await order.populate("user", "name email role");
    return order;
  }

  // Get all orders (Admin)
  async getAllOrders() {
    return await Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
  }

  // Update status (Admin)
  async updateOrderStatus(orderId, status) {
    if (!status) {
      throw createError("Status is required", 400);
    }

    const allowedStatuses = [
      "placed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      throw createError("Invalid order status", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw createError("Order not found", 404);
    }

    order.status = status;
    await order.save();
    return await order.populate("user", "name email role");
  }
}

// Export a single instance so all code uses the same service
module.exports = new OrderService();
