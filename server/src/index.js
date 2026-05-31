const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./config/db');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL || 'http://localhost:3000',
];

// Middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Health routes
const healthRoutes = require('./routes/healthRoutes');
app.use('/health', healthRoutes);

// Product routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Order routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

// Error handling
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
app.use(notFound);
app.use(errorHandler);

// Database and server start
connectDB();
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});