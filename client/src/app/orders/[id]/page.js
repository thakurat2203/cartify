"use client";

import api from "@/lib/api";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useAuth } from "@/context/auth-context";
import { orderDetailStyles as styles } from "@/lib/tailwind-styles";

const formatShippingMethod = (method) => {
  if (method === "express") {
    return "Express delivery";
  }

  return "Standard delivery";
};

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "";

export default function OrderDetailsPage({ params }) {
  const { id } = use(params);
  const { isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveMessage, setLiveMessage] = useState("");
  const orderLoaded = Boolean(order?._id);

  useEffect(() => {
    // Wait for auth hydration before redirecting or fetching this protected order.
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);

        setOrder(response.data.order);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message || err.message || "Failed to load order";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && id) {
      loadOrder();
    }
  }, [authLoading, id, isAuthenticated, router]);

  useEffect(() => {
    if (!id || !orderLoaded) {
      return;
    }

    // Use the same-origin rewrite so cookie auth matches the REST API calls.
    const socket = io({
      transports: ["polling"],
      withCredentials: true,
    });

    let refreshAttempted = false;

    socket.on("connect", () => {
      refreshAttempted = false;
      socket.emit("order:join", { orderId: id });
    });

    socket.on("connect_error", async (connectionError) => {
      if (refreshAttempted) {
        setLiveMessage(connectionError.message);
        return;
      }

      refreshAttempted = true;

      try {
        await api.post("/api/auth/refresh");
        socket.connect();
      } catch {
        setLiveMessage("Live updates are unavailable. Please log in again.");
      }
    });

    socket.on("order:status-updated", (data) => {
      if (data.orderId !== id) {
        return;
      }

      setOrder((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          status: data.status,
          updatedAt: data.updatedAt,
        };
      });

      setLiveMessage(`Live update: order is now ${formatStatus(data.status)}.`);
    });

    socket.on("order:error", (message) => {
      setLiveMessage(message);
    });

    return () => {
      socket.emit("order:leave", {
        orderId: id,
      });
      socket.disconnect();
    };
  }, [id, orderLoaded]);

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Order Details</h1>
          <p className={styles.message}>Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.backRow}>
          <Link href="/orders" className={styles.backLink}>
            Back to orders
          </Link>
        </div>

        <h1 className={styles.title}>Order Details</h1>

        {error && <p className={styles.error}>{error}</p>}

        {!error && order && (
          <div className={styles.card}>
            <div className={styles.section}>
              <p className={styles.row}>
                <strong className={styles.label}>Order ID:</strong>
                <span className={styles.value}>{order._id}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Fulfillment status:</strong>
                <span className={`${styles.value} ${styles.statusBadge}`}>
                  {formatStatus(order.status)}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Payment status:</strong>
                <span className={`${styles.value} ${styles.statusBadge}`}>
                  {formatStatus(order.paymentStatus)}
                </span>
              </p>
              {order.paidAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Paid on:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.paidAt)}
                  </span>
                </p>
              )}
              {order.failedAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Failed on:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.failedAt)}
                  </span>
                </p>
              )}
              {order.paymentFailureReason && (
                <p className={styles.row}>
                  <strong className={styles.label}>Payment issue:</strong>
                  <span className={styles.value}>
                    {order.paymentFailureReason}
                  </span>
                </p>
              )}
              {order.paymentStatus === "pending" &&
                order.stockReservationExpiresAt && (
                  <p className={styles.row}>
                    <strong className={styles.label}>
                      Payment expires:
                    </strong>
                    <span className={styles.value}>
                      {formatDateTime(order.stockReservationExpiresAt)}
                    </span>
                  </p>
                )}
              {liveMessage && (
                <p className={styles.liveMessage}>{liveMessage}</p>
              )}
              <p className={styles.row}>
                <strong className={styles.label}>Placed on:</strong>
                <span className={styles.value}>
                  {formatDateTime(order.createdAt)}
                </span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping Info</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Full name:</strong>
                <span className={styles.value}>
                  {order.shippingInfo.fullName}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Email:</strong>
                <span className={styles.value}>{order.shippingInfo.email}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Phone:</strong>
                <span className={styles.value}>{order.shippingInfo.phone}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Address:</strong>
                <span className={styles.value}>
                  {order.shippingInfo.addressLine1}
                  {order.shippingInfo.addressLine2 &&
                    `, ${order.shippingInfo.addressLine2}`}
                  , {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
                  {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Shipping:</strong>
                <span className={styles.value}>
                  {formatShippingMethod(order.shippingMethod)}
                </span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Items</h2>
              <ul className={styles.items}>
                {order.orderItems.map((item) => (
                  <li
                    key={`${item.product}-${item.name}`}
                    className={styles.item}
                  >
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.value}>Qty: {item.quantity}</p>
                    <p className={styles.value}>Price: Rs. {item.price}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Summary</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Total items:</strong>
                <span className={styles.value}>{order.totalItems}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Subtotal:</strong>
                <span className={styles.value}>Rs. {order.subtotal}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Shipping fee:</strong>
                <span className={styles.value}>Rs. {order.shippingFee}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Platform fee:</strong>
                <span className={styles.value}>Rs. {order.platformFee}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Total price:</strong>
                <span className={styles.value}>Rs. {order.totalPrice}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
