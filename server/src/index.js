const express = require("express");
const cors = require("cors");
const config = require("./config");
const connectDB = require("./config/db");
const http = require("http");
const { initializeSocket } = require("./socket");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const sendErrorResponse = require("./utils/errorResponse");

const app = express();
const server = http.createServer(app);
app.use(helmet());
app.use(morgan("dev"));


// Restrict browser access to the configured frontend origins.
const allowedOrigins = ["http://localhost:3000", config.clientUrl];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  handler: (req, res) => {
    sendErrorResponse(res, {
      statusCode: 429,
      message: "Too many requests, please try again later",
      code: "API_RATE_LIMITED",
    });
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/api", apiLimiter);

app.use(express.json({ limit: "100kb" }));

const healthRoutes = require("./routes/healthRoutes");
app.use("/health", healthRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

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
