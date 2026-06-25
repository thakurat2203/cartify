const { Server } = require("socket.io");
const config = require("./config");
const Order = require("./models/Order");
const cookieParser = require("./middlewares/cookieParser");
const { verifyAccessToken } = require("./utils/authTokens");

let io;

const getOrderRoom = (orderId) => `order:${orderId}`;

const initializeSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Authenticate once during the Socket.IO handshake using the access cookie.
  io.use((socket, next) => {
    cookieParser(socket.request, null, () => {
      const accessToken =
        socket.request.cookies?.[config.accessCookieName];

      if (!accessToken) {
        next(new Error("Authentication required for live updates."));
        return;
      }

      try {
        const decoded = verifyAccessToken(accessToken);

        socket.user = {
          userId: decoded.userId,
          role: decoded.role,
        };

        next();
      } catch {
        next(new Error("Live-update session is invalid or expired."));
      }
    });
  });

  io.on("connection", (socket) => {
    socket.on("order:join", async ({ orderId }) => {
      try {
        if (!orderId) {
          socket.emit("order:error", "Order id is required.");
          return;
        }

        const order = await Order.findById(orderId);

        if (!order) {
          socket.emit("order:error", "Order not found.");
          return;
        }

        const isOwner = order.user.toString() === socket.user.userId;
        const isAdmin = socket.user.role === "admin";

        if (!isOwner && !isAdmin) {
          socket.emit("order:error", "You cannot watch this order.");
          return;
        }

        socket.join(getOrderRoom(orderId));
      } catch (err) {
        socket.emit("order:error", "Could not join live order updates.");
      }
    });

    socket.on("order:leave", ({ orderId }) => {
      if (orderId) {
        socket.leave(getOrderRoom(orderId));
      }
    });
  });

  return io;
};

const emitOrderStatusUpdated = (order) => {
  if (!io || !order) {
    return;
  }

  io.to(getOrderRoom(order._id.toString())).emit("order:status-updated", {
    orderId: order._id.toString(),
    status: order.status,
    updatedAt: order.updatedAt,
  });
};

module.exports = {
  initializeSocket,
  emitOrderStatusUpdated,
};
