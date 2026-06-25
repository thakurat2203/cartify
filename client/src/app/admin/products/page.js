"use client";

/* eslint-disable @next/next/no-img-element -- Product image URLs are admin-managed and not domain allow-listed yet. */

import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./page.module.css";

const STOCK_FILTERS = [
  { value: "all", label: "All products" },
  { value: "good", label: "Good stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

const getStockStatus = (stock) => {
  const quantity = Number(stock);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "out";
  }

  if (quantity <= 10) {
    return "low";
  }

  return "good";
};

export default function AdminProductsPage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [stockFilter, setStockFilter] = useState("all");

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

    const loadProducts = async () => {
      try {
        const response = await api.get("/api/products", {
          params: {
            limit: 50,
          },
        });

        setProducts(response.data.products || []);
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

  const handleDelete = async (productId) => {
    // Browser confirmation is the last safety check before deleting inventory.
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/products/${productId}`);

      setProducts((prev) =>
        prev.filter((product) => product._id !== productId),
      );
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

  const filteredProducts =
    stockFilter === "all"
      ? products
      : products.filter(
          (product) => getStockStatus(product.stock) === stockFilter,
        );

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

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {!error && products.length > 0 && (
          <div className={styles.filterRow}>
            <label htmlFor="stockFilter">Stock</label>
            <select
              id="stockFilter"
              className={styles.select}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              {STOCK_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {!error && products.length === 0 && (
          <p className={styles.message}>No products found.</p>
        )}

        {!error && products.length > 0 && filteredProducts.length === 0 && (
          <p className={styles.message}>No products match this filter.</p>
        )}

        {!error && filteredProducts.length > 0 && (
          <ul className={styles.list}>
            {filteredProducts.map((product) => (
              <li key={product._id} className={styles.card}>
                <div className={styles.thumbnail}>
                  {product.image && !imageErrors[product._id] ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.thumbnailImage}
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [product._id]: true,
                        }))
                      }
                    />
                  ) : null}

                  {!product.image || imageErrors[product._id] ? (
                    <div className={styles.fallbackLetter}>
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                  ) : null}
                </div>
                <div className={styles.cardMain}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.meta}>Category: {product.category}</p>
                  <p className={styles.meta}>Price: Rs. {product.price}</p>
                  <p className={styles.meta}>Stock: {product.stock}</p>
                  {product.stock > 10 ? (
                    <span className={`${styles.badge} ${styles.highstock}`}>
                      Good stock
                    </span>
                  ) : product.stock > 0 ? (
                    <span className={`${styles.badge} ${styles.lowstock}`}>
                      Low stock
                    </span>
                  ) : (
                    <span className={`${styles.badge} ${styles.outofstock}`}>
                      Out of stock
                    </span>
                  )}
                </div>

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
