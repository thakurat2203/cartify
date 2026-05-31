"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  validateProductName,
  validatePrice,
  validateStock,
  validateCategory,
  validateDescription,
} from "@/utils/validation";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function NewProductPage() {
  const { user, token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // Local state for product form data
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router, user]);

  // Generic input change handler
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Validate form and create new product
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation for product fields
    // Validate name
    const nameValidation = validateProductName(form.name);
    if (!nameValidation.valid) {
      setMessage(nameValidation.error);
      return;
    }

    // Validate price
    const priceValidation = validatePrice(form.price);
    if (!priceValidation.valid) {
      setMessage(priceValidation.error);
      return;
    }

    // Validate category
    const categoryValidation = validateCategory(form.category);
    if (!categoryValidation.valid) {
      setMessage(categoryValidation.error);
      return;
    }

    // Validate stock
    const stockValidation = validateStock(form.stock);
    if (!stockValidation.valid) {
      setMessage(stockValidation.error);
      return;
    }

    // Validate description if provided
    if (form.description) {
      const descriptionValidation = validateDescription(form.description);
      if (!descriptionValidation.valid) {
        setMessage(descriptionValidation.error);
        return;
      }
    }

    try {
      setSubmitting(true);
      setMessage("");

      // Send new product data to the server
      await axios.post(
        `${API_BASE}/api/products`,
        {
          name: form.name,
          price: Number(form.price),
          description: form.description,
          category: form.category,
          stock: Number(form.stock),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      router.push("/admin/products");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create product";
      setMessage(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Show placeholder while checking authentication
  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Create Product</h1>
          <p className={styles.message}>Checking access...</p>
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

        <h1 className={styles.title}>Create Product</h1>
        <p className={styles.subtitle}>Add a new product to your catalog.</p>

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

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Product"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
}
