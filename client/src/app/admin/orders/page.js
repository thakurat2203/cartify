"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_FILTERS = ["all", ...ORDER_STATUSES];

const formatShippingMethod = (method) => {
  if (method === "express") {
    return "Express delivery";
  }

  return "Standard delivery";
};

export default function AdminOrdersPage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Admin screens must wait for auth hydration before enforcing role access.
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
      return;
    }

    const loadOrders = async () => {
      try {
        const response = await api.get("/api/orders");

        setOrders(response.data.orders || []);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message || err.message || "Failed to load orders";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      loadOrders();
    }
  }, [authLoading, isAuthenticated, router, user]);

  // The dropdown edits local state first; the save button persists the selected status.
  const handleStatusChange = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: nextStatus } : order,
      ),
    );
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await api.put(
        `/api/orders/${orderId}/status`,
        { status },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? response.data.order : order,
        ),
      );
      setSuccess("Order status updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(", ")
          : err.message) ||
        "Failed to update status";
      setError(apiMessage);
      setTimeout(() => setError(""), 6000);
    } finally {
      setUpdatingId("");
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Admin Orders</h1>
          <p className={styles.message}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topRow}>
          <div>
            <Link href="/" className={styles.backLink}>
              Back to catalog
            </Link>
            <h1 className={styles.title}>Admin Orders</h1>
            <p className={styles.subtitle}>
              Review and manage customer orders.
            </p>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {!error && orders.length > 0 && (
          <div className={styles.filterRow}>
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All orders" : status}
                </option>
              ))}
            </select>
          </div>
        )}

        {!error && orders.length === 0 && (
          <p className={styles.message}>No orders found.</p>
        )}

        {!error && orders.length > 0 && filteredOrders.length === 0 && (
          <p className={styles.message}>No orders match this filter.</p>
        )}

        {!error && filteredOrders.length > 0 && (
          <ul className={styles.list}>
            {filteredOrders.map((order) => (
              <li key={order._id} className={styles.card}>
                <div className={styles.cardMain}>
                  <h2 className={styles.orderId}>Order #{order._id}</h2>
                  <p className={styles.meta}>
                    Customer: {order.user?.name} ({order.user?.email})
                  </p>
                  <p className={styles.meta}>Items: {order.totalItems}</p>
                  <p className={styles.meta}>Total: Rs. {order.totalPrice}</p>
                  <p className={styles.meta}>
                    Shipping: {formatShippingMethod(order.shippingMethod)}
                  </p>
                  <p className={styles.meta}>
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <span
                    className={`${styles.badge} ${styles[`status-${order.status}`]}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div className={styles.actions}>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className={styles.detailsLink}
                  >
                    View Details
                  </Link>

                  <select
                    className={styles.select}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => handleUpdateStatus(order._id, order.status)}
                    disabled={updatingId === order._id}
                  >
                    {updatingId === order._id ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
