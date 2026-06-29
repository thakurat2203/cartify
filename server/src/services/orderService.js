const config = require("../config");
const Order = require("../models/Order");
const Product = require("../models/Product");
const createError = require("../utils/createError");
const {
  validateEmail,
  validateName,
  validatePhone,
  validateAddressLine,
  validateCity,
  validateState,
  validatePostalCode,
  validateCountry,
  validateShippingMethod,
} = require("../utils/validation");

const shippingFees = {
  standard: 49,
  express: 149,
};

const platformFee = 10;
const fulfillmentStatuses = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const paidOnlyFulfillmentStatuses = ["processing", "shipped", "delivered"];

class OrderService {
  async createPendingPaymentOrder(orderData, userId) {
    await this.releaseExpiredPaymentReservations();

    const checkout = await this.buildCheckoutOrderPayload(orderData);
    const reservedItems = await this.reserveStock(checkout.orderItems);
    const now = new Date();

    try {
      // Razorpay checkout starts from an internal unpaid order with stock held.
      return await Order.create({
        user: userId,
        ...checkout,
        paymentStatus: "pending",
        stockReservationStatus: "reserved",
        stockReservedAt: now,
        stockReservationExpiresAt: new Date(
          now.getTime() + config.paymentReservationTtlMs,
        ),
      });
    } catch (err) {
      await this.releaseStock(reservedItems);
      throw err;
    }
  }

  async attachRazorpayOrderId(orderId, razorpayOrderId) {
    if (!razorpayOrderId) {
      throw createError("Razorpay order id is required", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (
      order.razorpayOrderId &&
      order.razorpayOrderId !== razorpayOrderId.trim()
    ) {
      throw createError("Order is already linked to another Razorpay order", 409);
    }

    order.razorpayOrderId = razorpayOrderId.trim();
    await order.save();
    return order;
  }

  async markOrderPaid({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) {
    const order = await this.findOrderForPaymentUpdate({
      orderId,
      razorpayOrderId,
    });

    if (order.paymentStatus === "paid") {
      if (
        (razorpayPaymentId && !order.razorpayPaymentId) ||
        (razorpaySignature && !order.razorpaySignature)
      ) {
        order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
        order.razorpaySignature = razorpaySignature || order.razorpaySignature;
        await order.save();
      }

      return order;
    }

    if (order.paymentStatus === "failed") {
      throw createError("Failed payment cannot be marked as paid", 409);
    }

    if (order.stockReservationStatus === "released") {
      throw createError("Released stock reservation cannot be confirmed", 409);
    }

    // Payment success confirms the existing stock reservation instead of
    // changing product stock again.
    order.paymentStatus = "paid";
    order.stockReservationStatus = "confirmed";
    order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
    order.razorpaySignature = razorpaySignature || order.razorpaySignature;
    order.paidAt = order.paidAt || new Date();
    order.paymentFailureReason = "";

    await order.save();
    return order;
  }

  async markOrderFailedAndReleaseStock({
    orderId,
    razorpayOrderId,
    reason = "Payment failed",
  }) {
    const query = this.buildPaymentUpdateQuery({
      orderId,
      razorpayOrderId,
    });
    const now = new Date();

    // Only the request that flips reserved -> released should return stock.
    // Repeated failure handling will miss this atomic update and skip release.
    const orderToRelease = await Order.findOneAndUpdate(
      {
        ...query,
        paymentStatus: { $ne: "paid" },
        stockReservationStatus: "reserved",
      },
      {
        $set: {
          paymentStatus: "failed",
          failedAt: now,
          paymentFailureReason: reason,
          status: "cancelled",
          stockReservationStatus: "released",
          stockReleasedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    if (orderToRelease) {
      await this.releaseStock(orderToRelease.orderItems);
      return orderToRelease;
    }

    const order = await Order.findOne(query);

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (order.paymentStatus === "paid") {
      return order;
    }

    if (
      order.paymentStatus === "failed" &&
      order.stockReservationStatus === "released"
    ) {
      return order;
    }

    order.paymentStatus = "failed";
    order.failedAt = order.failedAt || now;
    order.paymentFailureReason = reason;
    order.status = "cancelled";
    await order.save();
    return order;
  }

  async releaseExpiredPaymentReservations() {
    // Keep abandoned pending payments from holding inventory forever.
    const expiredOrders = await Order.find({
      paymentStatus: "pending",
      stockReservationStatus: "reserved",
      stockReservationExpiresAt: { $lte: new Date() },
    });

    let releasedCount = 0;

    for (const order of expiredOrders) {
      await this.markOrderFailedAndReleaseStock({
        orderId: order._id,
        reason: "Payment reservation expired",
      });
      releasedCount += 1;
    }

    return {
      checkedCount: expiredOrders.length,
      releasedCount,
    };
  }

  async buildCheckoutOrderPayload(orderData) {
    const { orderItems, shippingInfo, shippingMethod = "standard" } = orderData;

    this.validateCheckoutInput({ orderItems, shippingInfo, shippingMethod });

    // Keep only product id and quantity from the frontend; names/prices come
    // from MongoDB so browser-provided totals cannot be trusted.
    const normalizedOrderItems = orderItems.map((item) => ({
      product: item.product ? item.product.toString() : "",
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedOrderItems) {
      if (!item.product) {
        throw createError("Product id is required", 400);
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw createError("Quantity must be a positive integer", 400);
      }
    }

    const productQuantityMap = new Map();
    for (const item of normalizedOrderItems) {
      productQuantityMap.set(
        item.product,
        (productQuantityMap.get(item.product) || 0) + item.quantity,
      );
    }

    // Merge duplicate cart rows before stock checks so one product is reserved
    // with one combined quantity.
    const mergedOrderItems = Array.from(
      productQuantityMap,
      ([product, quantity]) => ({ product, quantity }),
    );

    const productIds = mergedOrderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // Build immutable order item snapshots using current catalog data.
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

    const totalItems = safeOrderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const subtotal = safeOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingFee = shippingFees[shippingMethod];
    const totalPrice = subtotal + shippingFee + platformFee;

    return {
      orderItems: safeOrderItems,
      shippingInfo: this.normalizeShippingInfo(shippingInfo),
      shippingMethod,
      subtotal,
      shippingFee,
      platformFee,
      totalItems,
      totalPrice,
    };
  }

  validateCheckoutInput({ orderItems, shippingInfo, shippingMethod }) {
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw createError("Order items are required", 400);
    }

    if (!shippingInfo) {
      throw createError("Shipping information is required", 400);
    }

    const validations = [
      validateName(shippingInfo.fullName),
      validateEmail(shippingInfo.email),
      validateShippingMethod(shippingMethod),
      validatePhone(shippingInfo.phone),
      validateAddressLine(shippingInfo.addressLine1),
      validateAddressLine(shippingInfo.addressLine2, false),
      validateCity(shippingInfo.city),
      validateState(shippingInfo.state),
      validatePostalCode(shippingInfo.postalCode),
      validateCountry(shippingInfo.country),
    ];

    const failedValidation = validations.find(
      (validation) => !validation.valid,
    );

    if (failedValidation) {
      throw createError(failedValidation.error, 400);
    }
  }

  normalizeShippingInfo(shippingInfo) {
    return {
      fullName: shippingInfo.fullName.trim(),
      email: shippingInfo.email.trim().toLowerCase(),
      phone: shippingInfo.phone.trim(),
      addressLine1: shippingInfo.addressLine1.trim(),
      addressLine2: shippingInfo.addressLine2
        ? shippingInfo.addressLine2.trim()
        : "",
      city: shippingInfo.city.trim(),
      state: shippingInfo.state.trim(),
      postalCode: shippingInfo.postalCode.trim(),
      country: shippingInfo.country.trim(),
    };
  }

  async findOrderForPaymentUpdate({ orderId, razorpayOrderId }) {
    const query = this.buildPaymentUpdateQuery({ orderId, razorpayOrderId });
    const order = await Order.findOne(query);

    if (!order) {
      throw createError("Order not found", 404);
    }

    return order;
  }

  buildPaymentUpdateQuery({ orderId, razorpayOrderId }) {
    if (!orderId && !razorpayOrderId) {
      throw createError("Order id or Razorpay order id is required", 400);
    }

    const query = orderId ? { _id: orderId } : { razorpayOrderId };

    if (orderId && razorpayOrderId) {
      query.razorpayOrderId = razorpayOrderId;
    }

    return query;
  }

  // Atomically reserve stock so simultaneous checkouts cannot oversell.
  async reserveStock(orderItems) {
    const reservedItems = [];

    try {
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { returnDocument: "after" },
        );

        if (!updatedProduct) {
          throw createError(`Not enough stock available for ${item.name}`, 400);
        }

        reservedItems.push(item);
      }

      return reservedItems;
    } catch (err) {
      await this.releaseStock(reservedItems);
      throw err;
    }
  }

  async releaseStock(orderItems) {
    if (orderItems.length === 0) {
      return;
    }

    await Product.bulkWrite(
      orderItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } },
        },
      })),
    );
  }

  async getMyOrders(userId) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

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

  async getAllOrders() {
    return await Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(orderId, status) {
    if (!status) {
      throw createError("Status is required", 400);
    }

    if (!fulfillmentStatuses.includes(status)) {
      throw createError("Invalid order status", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (
      paidOnlyFulfillmentStatuses.includes(status) &&
      order.paymentStatus !== "paid"
    ) {
      // Admins can view/cancel unpaid orders, but fulfillment starts only
      // after Razorpay payment is verified.
      throw createError("Only paid orders can move to fulfillment", 400);
    }

    order.status = status;
    await order.save();
    return await order.populate("user", "name email role");
  }
}

module.exports = new OrderService();
