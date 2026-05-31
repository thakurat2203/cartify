"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./page.module.css";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

// Configuration for the backend API base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/**
 * Home component displays the main product catalog grid.
 */
export default function Home() {
  // Local state for products, loading status, and potential errors
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Pull cart action from Zustand store
  const addToCart = useCartStore((state) => state.addToCart);

  // Fetch all products from the backend when the component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/products`);
        setProducts(response.data);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load products";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {/* Catalog Branding */}
        <div>
          <h1 className={styles.title}>Product Catalog</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Conditional rendering for loading and error states */}
        {loading && <p className={styles.info}>Loading products...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {/* Render message if no products are available */}
        {!loading && !error && products.length === 0 && (
          <p className={styles.info}>No products found.</p>
        )}

        {/* Render product catalog when data is ready */}
        {!loading && !error && products.length > 0 && (
          <>
            {/* Grid display of product cards */}
            <ul className={styles.grid}>
              {products.map((product) => (
                <li key={product._id}>
                  {/* Navigation to product details */}
                  <Link
                    href={`/products/${product._id}`}
                    className={styles.cardLink}
                  >
                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h2>{product.name}</h2>
                        <span className={styles.price}>
                          Rs. {product.price}
                        </span>
                      </div>
                      <p className={styles.description}>
                        {product.description || "No description yet."}
                      </p>
                      {/* Stock and Category details */}
                      <div className={styles.meta}>
                        <span>Stock: {product.stock}</span>
                        <span className={styles.category}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {/* Primary cart interaction */}
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => addToCart(product)}
                  >
                    Add to cart
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
