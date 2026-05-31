"use client";

import Link from "next/link";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import styles from "./page.module.css";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const { totalItems, totalPrice } = getCartTotals(cart);

  // Prevent UI flickering while reading from localStorage
  if (!cartReady) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1>Your cart</h1>
          <p className={styles.subtle}>Loading cart...</p>
        </div>
      </div>
    );
  }

  // Handle empty cart state
  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
        <h1>Your cart</h1>
        <p className={styles.subtle}>Your cart is empty right now.</p>
        <Link href="/" className={styles.summaryLink}>Back to catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.subtle}>
          <h1>Your cart</h1>
          <p>Total items: {totalItems}</p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className={styles.clearButton}
        >
          Clear cart
        </button>
      </div>

      <ul className={styles.list}>
        {cart.map((item) => (
          <li key={item.id} className={styles.item}>
            <div>
              <h2 className={styles.itemTitle}>{item.name}</h2>
              <p>Rs. {item.price}</p>
            </div>

            <div className={styles.controls}>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className={styles.controlButton}
              >
                -
              </button>

              <span>{item.quantity}</span>

              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className={styles.controlButton}
              >
                +
              </button>

              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className={styles.controlButton}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <h2>Total: Rs. {totalPrice}</h2>
        <Link href="/" className={styles.summaryLink}>Continue shopping</Link>
        <Link href="/checkout" className={styles.summaryLink}>
          Proceed to checkout
        </Link>
      </div>
      </div>
    </div>
  );
}
