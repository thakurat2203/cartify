const express = require("express");
const cors = require("cors");
const config = require("./config");
const connectDB = require("./config/db");
const http = require("http");
const { initializeSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Restrict browser access to the configured frontend origins.
const allowedOrigins = ["http://localhost:3000", config.clientUrl];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

const healthRoutes = require("./routes/healthRoutes");
app.use("/health", healthRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
app.use(notFound);
app.use(errorHandler);

connectDB();
initializeSocket(server, allowedOrigins);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
