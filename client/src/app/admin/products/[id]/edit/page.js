"use client";

/* eslint-disable @next/next/no-img-element -- Product image URLs are admin-managed and not domain allow-listed yet. */

import api from "@/lib/api";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  validateProductName,
  validatePrice,
  validateStock,
  validateCategory,
  validateDescription,
  validateImageUrl,
} from "@/utils/validation";
import styles from "./page.module.css";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const imagePreviewUrl = form.image.trim();
  const imagePreviewLetter = form.name.trim().charAt(0).toUpperCase() || "?";

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

    const loadProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);
        const product = response.data;

        setForm({
          name: product.name || "",
          price: product.price ?? "",
          description: product.description || "",
          category: product.category || "",
          stock: product.stock ?? "",
          image: product.image || "",
        });
        setImagePreviewFailed(false);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load product";
        setMessage(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated && user?.role === "admin") {
      loadProduct();
    }
  }, [authLoading, id, isAuthenticated, router, user]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      // A changed URL deserves a fresh preview attempt after a previous load error.
      setImagePreviewFailed(false);
    }

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client validation mirrors backend product rules before the admin submits.
    if (form.name) {
      const nameValidation = validateProductName(form.name);
      if (!nameValidation.valid) {
        setMessage(nameValidation.error);
        return;
      }
    }

    if (form.price) {
      const priceValidation = validatePrice(form.price);
      if (!priceValidation.valid) {
        setMessage(priceValidation.error);
        return;
      }
    }

    if (form.category) {
      const categoryValidation = validateCategory(form.category);
      if (!categoryValidation.valid) {
        setMessage(categoryValidation.error);
        return;
      }
    }

    if (form.stock !== "") {
      const stockValidation = validateStock(form.stock);
      if (!stockValidation.valid) {
        setMessage(stockValidation.error);
        return;
      }
    }

    if (form.description) {
      const descriptionValidation = validateDescription(form.description);
      if (!descriptionValidation.valid) {
        setMessage(descriptionValidation.error);
        return;
      }
    }

    const imageValidation = validateImageUrl(form.image);
    if (!imageValidation.valid) {
      setMessage(imageValidation.error);
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await api.put(
        `/api/products/${id}`,
        {
          name: form.name,
          price: Number(form.price),
          description: form.description,
          category: form.category,
          stock: Number(form.stock),
          image: form.image,
        },
      );

      router.push("/admin/products");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product";
      setMessage(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Edit Product</h1>
          <p className={styles.message}>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.backRow}>
          <Link href="/admin/products" className={styles.backLink}>
            Back to admin products
          </Link>
        </div>

        <h1 className={styles.title}>Edit Product</h1>
        <p className={styles.subtitle}>Update this product in your catalog.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Product name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              className={styles.textarea}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              placeholder="https://example.com/product-image.jpg"
              value={form.image}
              onChange={handleChange}
              className={styles.input}
            />
            <small className={styles.imageHint}>
              Paste a URL to a product image (optional)
            </small>

            <div className={styles.imagePreview}>
              {imagePreviewUrl && !imagePreviewFailed ? (
                <img
                  src={imagePreviewUrl}
                  alt={`${form.name || "Product"} preview`}
                  className={styles.imagePreviewImg}
                  onError={() => setImagePreviewFailed(true)}
                />
              ) : (
                <div className={styles.imagePreviewFallback}>
                  {imagePreviewLetter}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
}
