const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Product = require("../src/models/Product");
const sampleProducts = require("./sampleProducts");

const seed = async () => {
  try {
    await connectDB();

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log("Products already exist. Skipping seed.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const now = Date.now();
    const products = sampleProducts.map((product, index) => {
      const date = new Date(now - index * 60000);

      return {
        ...product,
        createdAt: date,
        updatedAt: date,
      };
    });

    await Product.insertMany(products);
    console.log(`Inserted ${sampleProducts.length} products.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

seed();
