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

class OrderService {
  async createOrder(orderData, userId) {
    const { orderItems, shippingInfo, shippingMethod = "standard" } = orderData;

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

    const shippingMethodValidation = validateShippingMethod(shippingMethod);
    if (!shippingMethodValidation.valid) {
      throw createError(shippingMethodValidation.error, 400);
    }

    // Validate the full checkout address before reserving stock.
    const phoneValidation = validatePhone(shippingInfo.phone);
    if (!phoneValidation.valid) {
      throw createError(phoneValidation.error, 400);
    }

    const addressLine1Validation = validateAddressLine(
      shippingInfo.addressLine1,
    );
    if (!addressLine1Validation.valid) {
      throw createError(addressLine1Validation.error, 400);
    }

    const addressLine2Validation = validateAddressLine(
      shippingInfo.addressLine2,
      false,
    );
    if (!addressLine2Validation.valid) {
      throw createError(addressLine2Validation.error, 400);
    }

    const cityValidation = validateCity(shippingInfo.city);
    if (!cityValidation.valid) {
      throw createError(cityValidation.error, 400);
    }

    const stateValidation = validateState(shippingInfo.state);
    if (!stateValidation.valid) {
      throw createError(stateValidation.error, 400);
    }

    const postalCodeValidation = validatePostalCode(shippingInfo.postalCode);
    if (!postalCodeValidation.valid) {
      throw createError(postalCodeValidation.error, 400);
    }

    const countryValidation = validateCountry(shippingInfo.country);
    if (!countryValidation.valid) {
      throw createError(countryValidation.error, 400);
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

    const calculatedSubtotal = safeOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const calculatedShippingFee = shippingFees[shippingMethod];
    const calculatedPlatformFee = platformFee;
    const calculatedTotalPrice =
      calculatedSubtotal + calculatedShippingFee + calculatedPlatformFee;

    const reservedItems = await this.reserveStock(safeOrderItems);

    try {
      const order = await Order.create({
        user: userId,
        orderItems: safeOrderItems,
        shippingInfo: {
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
        },
        shippingMethod,
        subtotal: calculatedSubtotal,
        shippingFee: calculatedShippingFee,
        platformFee: calculatedPlatformFee,
        totalItems: calculatedTotalItems,
        totalPrice: calculatedTotalPrice,
      });

      return order;
    } catch (err) {
      await this.releaseStock(reservedItems);
      throw err;
    }
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

    const allowedStatuses = [
      "placed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    // Keep status transitions constrained to values supported by the model and admin UI.
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

module.exports = new OrderService();
