const Razorpay = require("razorpay");
const config = require("../config");
const Order = require("../models/Order");
const orderService = require("./orderService");
const createError = require("../utils/createError");
const { verifyRazorpayCheckoutSignature } = require("../utils/paymentSignatures");

let razorpayClient;

const getRazorpayClient = () => {
  if (!config.razorpay.configured) {
    throw createError("Razorpay is not configured", 503);
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  return razorpayClient;
};

const toPaise = (amountInRupees) => {
  const amount = Number(amountInRupees);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError("Payment amount must be a positive number", 400);
  }

  return Math.round(amount * 100);
};

const normalizeVerifyPayload = (paymentData) => ({
  razorpayOrderId:
    paymentData.razorpay_order_id || paymentData.razorpayOrderId || "",
  razorpayPaymentId:
    paymentData.razorpay_payment_id || paymentData.razorpayPaymentId || "",
  razorpaySignature:
    paymentData.razorpay_signature || paymentData.razorpaySignature || "",
});

class PaymentService {
  async createRazorpayCheckoutOrder(checkoutData, userId) {
    const razorpay = getRazorpayClient();

    // Reserve stock before opening Checkout so another payment cannot oversell it.
    const internalOrder = await orderService.createPendingPaymentOrder(
      checkoutData,
      userId,
    );

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: toPaise(internalOrder.totalPrice),
        currency: config.razorpay.currency,
        receipt: `order_${internalOrder._id}`,
        notes: {
          internalOrderId: internalOrder._id.toString(),
          userId: userId.toString(),
          source: "cartify_test_mode",
        },
      });

      const order = await orderService.attachRazorpayOrderId(
        internalOrder._id,
        razorpayOrder.id,
      );

      return {
        order,
        checkout: this.buildCheckoutConfig(order, razorpayOrder),
      };
    } catch (err) {
      // If Razorpay order creation fails, release the reservation immediately.
      await orderService.markOrderFailedAndReleaseStock({
        orderId: internalOrder._id,
        reason: "Could not create Razorpay order",
      });

      throw createError(
        err.message || "Could not create Razorpay order",
        err.statusCode || 502,
      );
    }
  }

  async verifyCheckoutPayment(paymentData, userId, userRole) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      normalizeVerifyPayload(paymentData);

    // The backend key secret is the trust boundary for Checkout success.
    const isValidSignature = verifyRazorpayCheckoutSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      keySecret: config.razorpay.keySecret,
    });

    if (!isValidSignature) {
      throw createError("Invalid Razorpay payment signature", 400);
    }

    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (userRole !== "admin" && order.user.toString() !== userId) {
      throw createError("Forbidden: not your order", 403);
    }

    const paidOrder = await orderService.markOrderPaid({
      orderId: order._id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    await paidOrder.populate("user", "name email role");
    return paidOrder;
  }

  buildCheckoutConfig(order, razorpayOrder) {
    return {
      key: config.razorpay.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.id,
      internalOrderId: order._id,
      name: "Cartify",
      description: `Payment for order ${order._id}`,
      prefill: {
        name: order.shippingInfo.fullName,
        email: order.shippingInfo.email,
        contact: order.shippingInfo.phone,
      },
      theme: {
        color: "#06b6d4",
      },
    };
  }
}

module.exports = new PaymentService();
