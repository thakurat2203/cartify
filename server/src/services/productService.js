const Product = require("../models/Product");
const createError = require("../utils/createError");
const {
  validateProductName,
  validatePrice,
  validateStock,
  validateCategory,
  validateDescription,
  validateImageUrl,
} = require("../utils/validation");

class ProductService {
  async getAllProducts(queryOptions = {}) {
    const filter = this.buildProductFilter(queryOptions);
    const sortOption = this.buildSortOption(queryOptions.sort);
    const pagination = this.buildPagination(queryOptions);

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(filter),
    ]);

    return this.buildProductListResponse(products, totalProducts, pagination);
  }

  // Convert query-string filters into a MongoDB-safe filter object.
  buildProductFilter(queryOptions) {
    const { search, category, minPrice, maxPrice, stockStatus } = queryOptions;
    const filter = {};

    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    const trimmedCategory = typeof category === "string" ? category.trim() : "";

    if (trimmedSearch) {
      filter.$or = this.buildSearchFilter(trimmedSearch);
    }

    if (trimmedCategory) {
      filter.category = this.buildCategoryFilter(trimmedCategory);
    }

    const priceFilter = this.buildPriceFilter(minPrice, maxPrice);

    if (priceFilter) {
      filter.price = priceFilter;
    }

    if (stockStatus === "in_stock") {
      filter.stock = { $gt: 0 };
    }

    if (stockStatus === "out_of_stock") {
      filter.stock = 0;
    }

    return filter;
  }

  buildSearchFilter(search) {
    // Escape user input before building regex filters.
    const safeSearch = this.escapeRegex(search);

    return [
      { name: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  buildCategoryFilter(category) {
    const safeCategory = this.escapeRegex(category);

    return {
      $regex: `^${safeCategory}$`,
      $options: "i",
    };
  }

  buildPriceFilter(minPrice, maxPrice) {
    const priceFilter = {};

    if (minPrice !== undefined && minPrice !== "") {
      const parsedMinPrice = Number(minPrice);

      if (Number.isNaN(parsedMinPrice) || parsedMinPrice < 0) {
        throw createError("Minimum price must be a non-negative number", 400);
      }

      priceFilter.$gte = parsedMinPrice;
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      const parsedMaxPrice = Number(maxPrice);

      if (Number.isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
        throw createError("Maximum price must be a non-negative number", 400);
      }

      priceFilter.$lte = parsedMaxPrice;
    }

    if (
      priceFilter.$gte !== undefined &&
      priceFilter.$lte !== undefined &&
      priceFilter.$gte > priceFilter.$lte
    ) {
      throw createError(
        "Minimum price cannot be greater than maximum price",
        400,
      );
    }

    return Object.keys(priceFilter).length > 0 ? priceFilter : null;
  }

  buildSortOption(sort = "newest") {
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };

    if (!sortOptions[sort]) {
      throw createError("Invalid product sort option", 400);
    }

    return sortOptions[sort];
  }

  buildPagination(queryOptions) {
    const { page = 1, limit = 8 } = queryOptions;

    const pageNumber = this.parsePositiveInteger(page, 1);
    // Cap page size so catalog/admin requests cannot ask for unbounded result sets.
    const limitNumber = Math.min(this.parsePositiveInteger(limit, 8), 50);

    return {
      page: pageNumber,
      limit: limitNumber,
      skip: (pageNumber - 1) * limitNumber,
    };
  }

  buildProductListResponse(products, totalProducts, pagination) {
    const totalPages = Math.ceil(totalProducts / pagination.limit);

    return {
      products,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      totalProducts,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    };
  }

  parsePositiveInteger(value, fallback) {
    const parsed = Number.parseInt(value, 10);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  async getProductById(id) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError("Product not found", 404);
    }
    return product;
  }

  async createProduct(productData) {
    const { name, price, description, category, stock, image } = productData;

    // Backend validation remains the source of truth even when the admin UI validates first.
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

    const imageValidation = validateImageUrl(image);
    if (!imageValidation.valid) {
      throw createError(imageValidation.error, 400);
    }

    return await Product.create({
      name: name.trim(),
      price: Number(price),
      description: description ? description.trim() : "",
      category: category.trim(),
      stock: Number(stock),
      image: image ? image.trim() : "",
    });
  }

  async updateProduct(id, updateData) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError("Product not found", 404);
    }

    const { name, price, description, category, stock, image } = updateData;

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

    if (image !== undefined) {
      const imageValidation = validateImageUrl(image);
      if (!imageValidation.valid) {
        throw createError(imageValidation.error, 400);
      }
      product.image = image ? image.trim() : "";
    }

    return await product.save();
  }

  async deleteProduct(id) {
    const product = await Product.findById(id);

    if (!product) {
      throw createError("Product not found", 404);
    }

    await product.deleteOne();
    return { message: "Product deleted successfully" };
  }

  escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

module.exports = new ProductService();
