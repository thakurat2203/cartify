const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    // Snapshot product details at checkout so later catalog edits do not alter old orders.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const shippingInfoSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (value) => value.length > 0,
        "Order must have at least one item",
      ],
    },
    shippingInfo: {
      type: shippingInfoSchema,
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    subtotal: {
      type: Number,
      min: 0,
      default: 0,
    },
    shippingFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    platformFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
      index: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: "",
    },
    paidAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    paymentFailureReason: {
      type: String,
      trim: true,
      default: "",
    },
    stockReservationStatus: {
      type: String,
      enum: ["reserved", "confirmed", "released"],
      default: "confirmed",
      index: true,
    },
    stockReservedAt: {
      type: Date,
    },
    stockReservationExpiresAt: {
      type: Date,
      index: true,
    },
    stockReleasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
orderSchema.index({
  paymentStatus: 1,
  stockReservationStatus: 1,
  stockReservationExpiresAt: 1,
});

module.exports = mongoose.model("Order", orderSchema);
