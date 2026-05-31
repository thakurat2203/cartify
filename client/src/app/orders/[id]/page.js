"use client";

import axios from "axios";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

// Backend API base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function OrderDetailsPage({ params }) {
  // Extract the order ID from the dynamic route parameters
  const { id } = use(params);
  // Access auth state for token-based API requests
  const { token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // State management for order data and UI feedback
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Load order data from server using the ID and auth token
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
          err.response?.data?.message ||
          err.message ||
          "Failed to load order";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    // Trigger load if required identifiers are present
    if (token && id) {
      loadOrder();
    }
  }, [authLoading, id, isAuthenticated, router, token]);

  // Display loading state during initial checks or fetch
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

        {/* Error notification */}
        {error && <p className={styles.error}>{error}</p>}

        {!error && order && (
          <div className={styles.card}>
            {/* Basic Order Information */}
            <div className={styles.section}>
              <p className={styles.row}>
                <strong className={styles.label}>Order ID:</strong>
                <span className={styles.value}>{order._id}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Status:</strong>
                <span className={styles.value}>{order.status}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Placed on:</strong>
                <span className={styles.value}>
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </p>
            </div>

            {/* Shipping Destination Details */}
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

            {/* Line Items List */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Items</h2>
              <ul className={styles.items}>
                {order.orderItems.map((item) => (
                  <li key={`${item.product}-${item.name}`} className={styles.item}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.value}>Qty: {item.quantity}</p>
                    <p className={styles.value}>Price: Rs. {item.price}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial and Quantity Summary */}
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
          </div>
        )}
      </div>
    </div>
  );
}
