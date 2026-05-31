"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import { useAuth } from "@/context/auth-context";
import {
  validateName,
  validateEmail,
  validateAddress,
} from "@/utils/validation";
import styles from "./page.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function CheckoutPage() {
  // Access cart and auth context state
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const clearCart = useCartStore((state) => state.clearCart);
  const { totalItems, totalPrice } = getCartTotals(cart);
  const { isAuthenticated, authLoading, token } = useAuth();
  const router = useRouter();

  // Local state for shipping form and feedback messages
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Security: Redirect users to login if they are not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Prevent UI flickering while auth or cart persistence is resolving
  if (authLoading || !cartReady) {
    return (
      <div className={styles.page}>
        <div className={styles.backRow}>
          <Link href="/cart" className={styles.backLink}>
            Back to cart
          </Link>
        </div>

        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.message}>Loading checkout...</p>
      </div>
    );
  }

  // Generic change handler for form inputs
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Main order placement logic
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 1. Client-side form validation
    const nameValidation = validateName(form.fullName);
    if (!nameValidation.valid) {
      setMessage(nameValidation.error);
      return;
    }

    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) {
      setMessage(emailValidation.error);
      return;
    }

    const addressValidation = validateAddress(form.address);
    if (!addressValidation.valid) {
      setMessage(addressValidation.error);
      return;
    }

    // 2. Ensure cart is not empty before submitting
    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      // 3. Prepare order payload from cart items
      const orderItems = cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      }));

      // 4. Send creation request to backend with auth token
      const response = await axios.post(
        `${API_BASE}/api/orders`,
        {
          orderItems,
          shippingInfo: {
            fullName: form.fullName,
            email: form.email,
            address: form.address,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const createdOrder = response.data.order;

      // 5. Success cleanup: clear cart and redirect to order details
      clearCart();
      setForm({
        fullName: "",
        email: "",
        address: "",
      });

      router.push(`/orders/${createdOrder._id}`);
    } catch (err) {
      // Handle API errors gracefully
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to place order";
      setMessage(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <Link href="/cart" className={styles.backLink}>
          Back to cart
        </Link>
      </div>

      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.grid}>
        {/* Shipping Information Form */}
        <form onSubmit={handlePlaceOrder} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="4"
              className={styles.textarea}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        {/* Static Order Summary */}
        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <p>Total items: {totalItems}</p>
          <p>Total price: Rs. {totalPrice}</p>
        </aside>
      </div>
    </div>
  );
}
