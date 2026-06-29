const paymentService = require("../services/paymentService");

const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingInfo, shippingMethod } = req.body;
    const userId = req.user.userId;

    const { order, checkout } =
      await paymentService.createRazorpayCheckoutOrder(
        {
          orderItems,
          shippingInfo,
          shippingMethod,
        },
        userId,
      );

    res.status(201).json({
      message: "Razorpay order created successfully",
      order,
      checkout,
    });
  } catch (err) {
    next(err);
  }
};

const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const order = await paymentService.verifyCheckoutPayment(
      req.body,
      req.user.userId,
      req.user.role,
    );

    res.status(200).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
