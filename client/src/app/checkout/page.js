"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import { useAuth } from "@/context/auth-context";
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddressLine,
  validateCity,
  validateState,
  validatePostalCode,
  validateCountry,
  validateShippingMethod,
} from "@/utils/validation";
import { checkoutStyles as styles } from "@/lib/tailwind-styles";

const shippingOptions = [
  { value: "standard", label: "Standard delivery", fee: 49 },
  { value: "express", label: "Express delivery", fee: 149 },
];

const platformFee = 10;

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const clearCart = useCartStore((state) => state.clearCart);
  const { totalItems, totalPrice } = getCartTotals(cart);
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState(initialFormState);
  const [formTouched, setFormTouched] = useState(false);
  const [formPrefilled, setFormPrefilled] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedShippingOption =
    shippingOptions.find((option) => option.value === shippingMethod) ||
    shippingOptions[0];
  const checkoutTotal = totalPrice + selectedShippingOption.fee + platformFee;

  const stockIssue = cart.find((item) => {
    const availableStock = Number(item.stock);

    return Number.isInteger(availableStock) && item.quantity > availableStock;
  });

  // Checkout must wait for auth hydration before deciding whether to redirect.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !user ||
      formTouched ||
      formPrefilled
    ) {
      return;
    }

    const savedAddresses = Array.isArray(user.addresses)
      ? user.addresses
      : [];
    const defaultAddress =
      savedAddresses.find((address) => address.isDefault) || savedAddresses[0];

    setForm((prev) => ({
      ...prev,
      fullName: user.name || prev.fullName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      addressLine1: defaultAddress?.addressLine1 || prev.addressLine1,
      addressLine2: defaultAddress?.addressLine2 || prev.addressLine2,
      city: defaultAddress?.city || prev.city,
      state: defaultAddress?.state || prev.state,
      postalCode: defaultAddress?.postalCode || prev.postalCode,
      country: defaultAddress?.country || prev.country,
    }));
    setFormPrefilled(true);
  }, [
    authLoading,
    formPrefilled,
    formTouched,
    isAuthenticated,
    user,
  ]);

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

  const handleChange = (e) => {
    setFormTouched(true);
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleShippingMethodChange = (e) => {
    setShippingMethod(e.target.value);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Client validation mirrors the backend before sending the order.
    const validations = [
      validateName(form.fullName),
      validateEmail(form.email),
      validatePhone(form.phone),
      validateAddressLine(form.addressLine1),
      validateAddressLine(form.addressLine2, false),
      validateCity(form.city),
      validateState(form.state),
      validatePostalCode(form.postalCode),
      validateCountry(form.country),
      validateShippingMethod(shippingMethod),
    ];

    const failedValidation = validations.find(
      (validation) => !validation.valid,
    );
    if (failedValidation) {
      setMessage(failedValidation.error);
      return;
    }

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    if (stockIssue) {
      setMessage(
        `${stockIssue.name} only has ${stockIssue.stock} item(s) available.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      // Only send product id and quantity; backend owns prices and totals.
      const orderItems = cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      }));

      const response = await api.post(
        "/api/orders",
        {
          orderItems,
          shippingInfo: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          shippingMethod,
        },
      );

      const createdOrder = response.data.order;

      clearCart();
      setForm(initialFormState);
      setFormTouched(false);
      setFormPrefilled(false);
      setShippingMethod("standard");

      router.push(`/orders/${createdOrder._id}`);
    } catch (err) {
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
      <p className={styles.subtitle}>
        Confirm shipping details and review your order total before placing it.
      </p>

      <div className={styles.grid}>
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
              type="email"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="addressLine1">Address line 1</label>
            <input
              id="addressLine1"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="addressLine2">Address line 2</label>
            <input
              id="addressLine2"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="state">State</label>
            <input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="postalCode">Postal code</label>
            <input
              id="postalCode"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="country">Country</label>
            <input
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="shippingMethod">Shipping method</label>
            <select
              id="shippingMethod"
              value={shippingMethod}
              onChange={handleShippingMethodChange}
              className={styles.select}
            >
              {shippingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - Rs. {option.fee}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || Boolean(stockIssue)}
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>

          {stockIssue && (
            <p className={styles.message}>
              Update your cart quantity before placing this order.
            </p>
          )}

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>

          <div className={styles.summaryItem}>
            <span>Total items</span>
            <span>{totalItems}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Subtotal</span>
            <span>Rs. {totalPrice}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Shipping</span>
            <span>Rs. {selectedShippingOption.fee}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Platform fee</span>
            <span>Rs. {platformFee}</span>
          </div>

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>Rs. {checkoutTotal}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
