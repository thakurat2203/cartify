const Product = require("../models/Product");
const createError = require("../utils/createError");
const {
  validateProductName,
  validatePrice,
  validateStock,
  validateCategory,
  validateDescription,
} = require("../utils/validation");

class ProductService {
  // Get all products
  async getAllProducts() {
    return await Product.find();
  }

  // Get product by ID
  async getProductById(id) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError("Product not found", 404);
    }
    return product;
  }

  // Create product
  async createProduct(productData) {
    const { name, price, description, category, stock } = productData;

    const nameValidation = validateProductName(name);
    if (!nameValidation.valid) {
      throw createError(nameValidation.error, 400);
    }

    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      throw createError(priceValidation.error, 400);
    }

    const categoryValidation = validateCategory(category);
    if (!categoryValidation.valid) {
      throw createError(categoryValidation.error, 400);
    }

    const stockValidation = validateStock(stock);
    if (!stockValidation.valid) {
      throw createError(stockValidation.error, 400);
    }

    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.valid) {
      throw createError(descriptionValidation.error, 400);
    }

    return await Product.create({
      name: name.trim(),
      price: Number(price),
      description: description ? description.trim() : "",
      category: category.trim(),
      stock: Number(stock),
    });
  }

  // Update product
  async updateProduct(id, updateData) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError("Product not found", 404);
    }

    const { name, price, description, category, stock } = updateData;

    if (name !== undefined) {
      const nameValidation = validateProductName(name);
      if (!nameValidation.valid) {
        throw createError(nameValidation.error, 400);
      }
      product.name = name.trim();
    }

    if (price !== undefined) {
      const priceValidation = validatePrice(price);
      if (!priceValidation.valid) {
        throw createError(priceValidation.error, 400);
      }
      product.price = Number(price);
    }

    if (category !== undefined) {
      const categoryValidation = validateCategory(category);
      if (!categoryValidation.valid) {
        throw createError(categoryValidation.error, 400);
      }
      product.category = category.trim();
    }

    if (stock !== undefined) {
      const stockValidation = validateStock(stock);
      if (!stockValidation.valid) {
        throw createError(stockValidation.error, 400);
      }
      product.stock = Number(stock);
    }

    if (description !== undefined) {
      const descriptionValidation = validateDescription(description);
      if (!descriptionValidation.valid) {
        throw createError(descriptionValidation.error, 400);
      }
      product.description = description ? description.trim() : "";
    }

    return await product.save();
  }

  // Delete product
  async deleteProduct(id) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError("Product not found", 404);
    }

    await product.deleteOne();
    return { message: "Product deleted successfully" };
  }
}

// Export a single instance so all code uses the same service
module.exports = new ProductService();
