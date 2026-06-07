"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const formatShippingMethod = (method) => {
  if (method === "express") {
    return "Express delivery";
  }

  return "Standard delivery";
};

export default function OrdersPage() {
  const { token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for auth hydration before redirecting or fetching token-protected orders.
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data.orders || []);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message || err.message || "Failed to load orders";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadOrders();
    }
  }, [authLoading, isAuthenticated, router, token]);

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.message}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.backRow}>
          <Link href="/" className={styles.backLink}>
            Back to catalog
          </Link>
        </div>

        <h1 className={styles.title}>My Orders</h1>

        {error && <p className={styles.error}>{error}</p>}

        {!error && orders.length === 0 && (
          <p className={styles.message}>You have not placed any orders yet.</p>
        )}

        {!error && orders.length > 0 && (
          <ul className={styles.list}>
            {orders.map((order) => (
              <li key={order._id} className={styles.card}>
                <p className={styles.row}>
                  <strong className={styles.label}>Order ID:</strong>
                  <span className={styles.value}>{order._id}</span>
                </p>
                <p className={styles.row}>
                  <strong className={styles.label}>Status:</strong>
                  <span className={styles.value}>{order.status}</span>
                </p>
                <p className={styles.row}>
                  <strong className={styles.label}>Total items:</strong>
                  <span className={styles.value}>{order.totalItems}</span>
                </p>
                <p className={styles.row}>
                  <strong className={styles.label}>Total price:</strong>
                  <span className={styles.value}>Rs. {order.totalPrice}</span>
                </p>
                <p className={styles.row}>
                  <strong className={styles.label}>Shipping:</strong>
                  <span className={styles.value}>
                    {formatShippingMethod(order.shippingMethod)}
                  </span>
                </p>
                <p className={styles.row}>
                  <strong className={styles.label}>Placed on:</strong>
                  <span className={styles.value}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </p>

                <Link
                  href={`/orders/${order._id}`}
                  className={styles.detailsLink}
                >
                  View details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
