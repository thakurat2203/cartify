const productService = require("../services/productService");

// Product controllers only read request data and delegate rules to the service.
const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await productService.getProductById(productId);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, stock, image } = req.body;
    const product = await productService.createProduct({
      name,
      price,
      description,
      category,
      stock,
      image,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { name, price, description, category, stock, image } = req.body;
    const updatedProduct = await productService.updateProduct(productId, {
      name,
      price,
      description,
      category,
      stock,
      image,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const result = await productService.deleteProduct(productId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
