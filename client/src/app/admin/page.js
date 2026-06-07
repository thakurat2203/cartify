"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "";

export default function AdminDashboardPage() {
  const { user, token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Admin pages should only be visible to logged-in admin users.
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
      return;
    }

    // Dashboard combines order, revenue, and stock summaries from the API.
    const loadDashboard = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(response.data.dashboard);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin" && token) {
      loadDashboard();
    }
  }, [authLoading, isAuthenticated, router, token, user]);

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.message}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const orderStatusEntries = dashboard
    ? Object.entries(dashboard.ordersByStatus)
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topRow}>
          <div>
            <Link href="/" className={styles.backLink}>
              Back to catalog
            </Link>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Track store activity, order progress, and inventory health.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/admin/products" className={styles.secondaryButton}>
              Products
            </Link>
            <Link href="/admin/orders" className={styles.primaryButton}>
              Orders
            </Link>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!error && dashboard && (
          <>
            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Products</span>
                <strong className={styles.statValue}>
                  {dashboard.totalProducts}
                </strong>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Orders</span>
                <strong className={styles.statValue}>
                  {dashboard.totalOrders}
                </strong>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Order value</span>
                <strong className={styles.statValue}>
                  {formatCurrency(dashboard.totalRevenue)}
                </strong>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Active orders</span>
                <strong className={styles.statValue}>
                  {dashboard.activeOrders}
                </strong>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Low stock</span>
                <strong className={styles.statValue}>
                  {dashboard.lowStockCount}
                </strong>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Out of stock</span>
                <strong className={styles.statValue}>
                  {dashboard.outOfStockCount}
                </strong>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Orders by Status</h2>
                <Link href="/admin/orders" className={styles.inlineLink}>
                  View orders
                </Link>
              </div>

              <div className={styles.statusGrid}>
                {orderStatusEntries.map(([status, count]) => (
                  <div key={status} className={styles.statusCard}>
                    <span className={styles.statusLabel}>
                      {formatStatus(status)}
                    </span>
                    <strong className={styles.statusValue}>{count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.twoColumnGrid}>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recent Orders</h2>
                  <Link href="/admin/orders" className={styles.inlineLink}>
                    View all
                  </Link>
                </div>

                {dashboard.recentOrders.length === 0 ? (
                  <p className={styles.message}>No recent orders yet.</p>
                ) : (
                  <ul className={styles.list}>
                    {dashboard.recentOrders.map((order) => (
                      <li key={order._id} className={styles.listItem}>
                        <div>
                          <p className={styles.itemTitle}>Order #{order._id}</p>
                          <p className={styles.meta}>
                            {order.user?.name || "Unknown customer"} -{" "}
                            {formatStatus(order.status)}
                          </p>
                        </div>
                        <strong className={styles.price}>
                          {formatCurrency(order.totalPrice)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Low Stock Products</h2>
                  <Link href="/admin/products" className={styles.inlineLink}>
                    View products
                  </Link>
                </div>

                {dashboard.lowStockProducts.length === 0 ? (
                  <p className={styles.message}>No low-stock products.</p>
                ) : (
                  <ul className={styles.list}>
                    {dashboard.lowStockProducts.map((product) => (
                      <li key={product._id} className={styles.listItem}>
                        <div>
                          <p className={styles.itemTitle}>{product.name}</p>
                          <p className={styles.meta}>{product.category}</p>
                        </div>
                        <strong className={styles.warning}>
                          {product.stock} left
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Out of Stock Products</h2>
                <Link href="/admin/products" className={styles.inlineLink}>
                  View products
                </Link>
              </div>

              {dashboard.outOfStockProducts.length === 0 ? (
                <p className={styles.message}>No out-of-stock products.</p>
              ) : (
                <ul className={styles.list}>
                  {dashboard.outOfStockProducts.map((product) => (
                    <li key={product._id} className={styles.listItem}>
                      <div>
                        <p className={styles.itemTitle}>{product.name}</p>
                        <p className={styles.meta}>{product.category}</p>
                      </div>
                      <strong className={styles.danger}>Out of stock</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
