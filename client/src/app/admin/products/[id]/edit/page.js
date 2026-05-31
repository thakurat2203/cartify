"use client";

import axios from "axios";
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
} from "@/utils/validation";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const { user, token, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // State for the product being edited
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Authenticate admin and fetch product data
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
      return;
    }

    // Load product details for editing
    const loadProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/products/${id}`);
        const product = response.data;

        setForm({
          name: product.name || "",
          price: product.price ?? "",
          description: product.description || "",
          category: product.category || "",
          stock: product.stock ?? "",
        });
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

  // Handle changes for all form fields
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Validate and submit product updates
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform client-side validation
    if (form.name) {
      const nameValidation = validateProductName(form.name);
      if (!nameValidation.valid) {
        setMessage(nameValidation.error);
        return;
      }
    }

    // Validate price if provided
    if (form.price) {
      const priceValidation = validatePrice(form.price);
      if (!priceValidation.valid) {
        setMessage(priceValidation.error);
        return;
      }
    }

    // Validate category if provided
    if (form.category) {
      const categoryValidation = validateCategory(form.category);
      if (!categoryValidation.valid) {
        setMessage(categoryValidation.error);
        return;
      }
    }

    // Validate stock if provided
    if (form.stock !== "") {
      const stockValidation = validateStock(form.stock);
      if (!stockValidation.valid) {
        setMessage(stockValidation.error);
        return;
      }
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

      // Update the product record in the database
      await axios.put(
        `${API_BASE}/api/products/${id}`,
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
        "Failed to update product";
      setMessage(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
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
