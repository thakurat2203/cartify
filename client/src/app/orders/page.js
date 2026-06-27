"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ordersStyles as styles } from "@/lib/tailwind-styles";

const formatShippingMethod = (method) => {
  if (method === "express") {
    return "Express delivery";
  }

  return "Standard delivery";
};

export default function OrdersPage() {
  const { isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for auth hydration before redirecting or fetching protected orders.
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        const response = await api.get("/api/orders/my-orders");

        setOrders(response.data.orders || []);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message || err.message || "Failed to load orders";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadOrders();
    }
  }, [authLoading, isAuthenticated, router]);

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
                  <span className={`${styles.value} ${styles.statusBadge}`}>
                    {order.status}
                  </span>
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
