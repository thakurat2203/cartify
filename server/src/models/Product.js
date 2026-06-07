const mongoose = require("mongoose");

// Product fields support both public catalog display and admin inventory edits.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, default: "general" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
