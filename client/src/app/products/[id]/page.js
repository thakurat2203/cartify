"use client";

/* eslint-disable @next/next/no-img-element -- Product image URLs are admin-managed and not domain allow-listed yet. */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart-store";
import { productDetailStyles as styles } from "@/lib/tailwind-styles";

const getStockBadge = (stock) => {
  const quantity = Number(stock);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { label: "Out of stock", className: styles.outStock };
  }

  if (quantity < 10) {
    return { label: "Low stock", className: styles.lowStock };
  }

  return { label: "Good stock", className: styles.goodStock };
};

export default function ProductDetailPage({ params }) {
  const { id } = use(params);

  // Each product page owns its own fetch state because route params change per item.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Reload details when the dynamic product id changes.
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setImageUnavailable(false);

      try {
        const response = await api.get(`/api/products/${id}`);
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
        <Link href="/" className={styles.backLink}>
          <span aria-hidden="true">&larr;</span>
          Back to catalog
        </Link>

        {loading && <p className={styles.info}>Loading product...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading &&
          !error &&
          product &&
          (() => {
            const stockBadge = getStockBadge(product.stock);

            return (
              <article className={styles.card}>
                <div className={styles.hero}>
                  <div className={styles.imagePlaceholder}>
                    {product.image && !imageUnavailable ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                        onError={() => setImageUnavailable(true)}
                      />
                    ) : (
                      <div className={styles.fallbackLetterLarge}>
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.content}>
                    <p className={styles.category}>{product.category}</p>
                    <h1 className={styles.title}>{product.name}</h1>
                    <p className={styles.price}>Rs. {product.price}</p>
                    <p className={styles.description}>
                      {product.description || "No description available."}
                    </p>
                    <div className={styles.meta}>
                      <span>Stock: {product.stock}</span>
                      <span
                        className={`${styles.stockBadge} ${stockBadge.className}`}
                      >
                        {stockBadge.label}
                      </span>
                    </div>

                    {product.stock > 0 && (
                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => addToCart(product)}
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })()}
      </div>
    </div>
  );
}
