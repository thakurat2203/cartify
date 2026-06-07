const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("./config");
const Order = require("./models/Order");

let io;

const getOrderRoom = (orderId) => `order:${orderId}`;

const initializeSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("order:join", async ({ orderId, token }) => {
      try {
        if (!orderId || !token) {
          socket.emit("order:error", "Order id and token are required.");
          return;
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        const order = await Order.findById(orderId);

        if (!order) {
          socket.emit("order:error", "Order not found.");
          return;
        }

        const isOwner = order.user.toString() === decoded.userId;
        const isAdmin = decoded.role === "admin";

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
