"use client";

import axios from "axios";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

// Backend API URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Valid order lifecycle stages
// Available order statuses for admin management
const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "";

export default function AdminOrderDetailsPage({ params }) {
  const { id } = use(params);
  const { user, token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // Local state for order data and management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Auth and Authorization check: Only admins can view this page
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
      return;
    }

    // Fetch order details from backend
    const loadOrder = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrder(response.data.order);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message || err.message || "Failed to load order";
        setMessage(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated && user?.role === "admin") {
      loadOrder();
    }
  }, [authLoading, id, isAuthenticated, router, token, user]);

  // Handle status selection changes
  const handleStatusChange = (e) => {
    setOrder((prev) => ({
      ...prev,
      status: e.target.value,
    }));
  };

  // Save the updated status to the database
  const handleStatusUpdate = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await axios.put(
        `${API_BASE}/api/orders/${id}/status`,
        { status: order.status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrder(response.data.order);
      setMessage(response.data.message || "Status updated successfully.");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to update status";
      setMessage(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  // Loading view
  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Admin Order Details</h1>
          <p className={styles.message}>Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.backRow}>
          <Link href="/admin/orders" className={styles.backLink}>
            Back to admin orders
          </Link>
        </div>

        <h1 className={styles.title}>Admin Order Details</h1>

        {message && <p className={styles.message}>{message}</p>}

        {order && (
          <div className={styles.card}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Order Info</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Order ID:</strong>
                <span className={styles.value}>{order._id}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Status:</strong>
                <span
                  className={`${styles.badge} ${styles[`status-${order.status}`]}`}
                >
                  {formatStatus(order.status)}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Placed on:</strong>
                <span className={styles.value}>
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Customer</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Name:</strong>
                <span className={styles.value}>{order.user?.name}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Email:</strong>
                <span className={styles.value}>{order.user?.email}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Role:</strong>
                <span className={styles.value}>{order.user?.role}</span>
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
                <strong className={styles.label}>Address:</strong>
                <span className={styles.value}>
                  {order.shippingInfo.address}
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
                <strong className={styles.label}>Total price:</strong>
                <span className={styles.value}>Rs. {order.totalPrice}</span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Manage Status</h2>
              <div className={styles.statusControls}>
                <select
                  className={styles.select}
                  value={order.status}
                  onChange={handleStatusChange}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleStatusUpdate}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
