"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function ProductDetailPage({ params }) {
  // Extract the product ID from route parameters
  const { id } = use(params);

  // State management for product data, loading, and error states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details from the API on mount or when ID changes
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load product";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* Back navigation */}
        <Link href="/" className={styles.backLink}>
          Back to catalog
        </Link>

        {/* Status messages */}
        {loading && <p className={styles.info}>Loading product...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {/* Product Information Display */}
        {!loading && !error && product && (
          <article className={styles.card}>
            <div className={styles.hero}>
              <div className={styles.imagePlaceholder}>
                {product.name.charAt(0)}
              </div>
              <div className={styles.content}>
                <p className={styles.category}>{product.category}</p>
                <h1 className={styles.title}>{product.name}</h1>
                <p className={styles.price}>Rs. {product.price}</p>
                <p className={styles.description}>
                  {product.description || "No description available."}
                </p>
                {/* Stock and Status details */}
                <div className={styles.meta}>
                  <span>Stock: {product.stock}</span>
                  <span>
                    Status: {product.stock > 0 ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
