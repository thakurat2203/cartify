"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/**
 * Admin dashboard to view and manage all products.
 */
export default function AdminProductsPage() {
  const { user, token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Effect to verify admin access and load product data
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
      return;
    }

    // API call to fetch products
    const loadProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/products`);
        setProducts(response.data || []);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load products";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      loadProducts();
    }
  }, [authLoading, isAuthenticated, router, user]);

  // Delete product logic with confirmation
  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state after deletion
      setProducts((prev) => prev.filter((product) => product._id !== productId));
      setSuccess("Product deleted successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(", ")
          : err.message) ||
        "Failed to delete product";
      setError(apiMessage);
      setTimeout(() => setError(""), 6000);
    }
  };

  // Placeholder for loading states
  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Admin Products</h1>
          <p className={styles.message}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Page header and primary actions */}
        <div className={styles.topRow}>
          <div>
            <Link href="/" className={styles.backLink}>
              Back to catalog
            </Link>
            <h1 className={styles.title}>Admin Products</h1>
            <p className={styles.subtitle}>
              Manage your product inventory here.
            </p>
          </div>

          <Link href="/admin/products/new" className={styles.primaryButton}>
            Create Product
          </Link>
        </div>

        {/* User feedback messages */}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {!error && products.length === 0 && (
          <p className={styles.message}>No products found.</p>
        )}

        {/* Interactive product inventory list */}
        {!error && products.length > 0 && (
          <ul className={styles.list}>
            {products.map((product) => (
              <li key={product._id} className={styles.card}>
                <div className={styles.cardMain}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.meta}>Category: {product.category}</p>
                  <p className={styles.meta}>Price: Rs. {product.price}</p>
                  <p className={styles.meta}>Stock: {product.stock}</p>
                  {/* Dynamic stock status badges */}
                  {product.stock > 10 ? (
                    <span className={`${styles.badge} ${styles.highstock}`}>Good stock</span>
                  ) : product.stock > 0 ? (
                    <span className={`${styles.badge} ${styles.lowstock}`}>Low stock</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.outofstock}`}>Out of stock</span>
                  )}
                </div>

                {/* Administrative actions for individual products */}
                <div className={styles.actions}>
                  <Link
                    href={`/admin/products/${product._id}/edit`}
                    className={styles.secondaryButton}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
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