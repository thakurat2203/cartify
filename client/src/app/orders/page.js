"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function OrdersPage() {
  // Get authentication state and routing
  const { token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // Local state for orders, loading, and error handling
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to login if the user is not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Fetch orders belonging to the logged-in user
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
          err.response?.data?.message ||
          err.message ||
          "Failed to load orders";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    // Only attempt to load orders if we have an auth token
    if (token) {
      loadOrders();
    }
  }, [authLoading, isAuthenticated, router, token]);

  // Show loading state while checking auth or fetching data
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

        {/* Show error message if fetch fails */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Show message if no orders exist */}
        {!error && orders.length === 0 && (
          <p className={styles.message}>You have not placed any orders yet.</p>
        )}

        {/* Render the list of orders */}
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
                  <strong className={styles.label}>Placed on:</strong>
                  <span className={styles.value}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </p>

                {/* Link to view specific order details */}
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
