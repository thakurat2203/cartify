"use client";

import Link from "next/link";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import { cartStyles as styles } from "@/lib/tailwind-styles";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const { totalItems, totalPrice } = getCartTotals(cart);
  const stockIssue = cart.find((item) => {
    const availableStock = Number(item.stock);

    return Number.isInteger(availableStock) && item.quantity > availableStock;
  });

  // Wait for persisted cart hydration before showing an empty-cart state.
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

  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1>Your cart</h1>
          <p className={styles.subtle}>Your cart is empty right now.</p>
          <Link href="/" className={styles.summaryLink}>
            Back to catalog
          </Link>
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
          {cart.map((item) => {
            const availableStock = Number(item.stock);
            const hasKnownStock = Number.isInteger(availableStock);
            const hasItemStockIssue =
              hasKnownStock && item.quantity > availableStock;

            return (
              <li key={item.id} className={styles.item}>
                <div>
                  <h2 className={styles.itemTitle}>{item.name}</h2>
                  <p>Rs. {item.price}</p>
                  {hasKnownStock && (
                    <p className={styles.stockNote}>
                      Available stock: {availableStock}
                    </p>
                  )}
                  {hasItemStockIssue && (
                    <p className={styles.stockWarning}>
                      Reduce quantity before checkout.
                    </p>
                  )}
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
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity + 1,
                        hasKnownStock ? availableStock : undefined,
                      )
                    }
                    disabled={hasKnownStock && item.quantity >= availableStock}
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
            );
          })}
        </ul>

        <div className={styles.summary}>
          <h2>Total: Rs. {totalPrice}</h2>
          <div className={styles.summaryActions}>
            <Link href="/" className={styles.summaryLink}>
              Continue shopping
            </Link>
            {stockIssue ? (
              <span className={`${styles.summaryLink} ${styles.disabledLink}`}>
                Proceed to checkout
              </span>
            ) : (
              <Link href="/checkout" className={styles.summaryLink}>
                Proceed to checkout
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
