"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCartStore } from "@/store/cart-store";
import { productCartActionStyles as styles } from "@/lib/tailwind-styles";

export default function ProductCartAction({
  product,
  compact = false,
  className = "",
  addLabel,
  outOfStockLabel,
}) {
  const router = useRouter();
  const { authLoading, isAuthenticated } = useAuth();
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  if (!product?._id) {
    return null;
  }

  const cartItem = cart.find(
    (item) => String(item.id) === String(product._id),
  );
  const quantityInCart = cartItem?.quantity || 0;
  const availableStock = Number(product.stock);
  const hasKnownStock = Number.isInteger(availableStock);
  const isOutOfStock = hasKnownStock && availableStock < 1;
  const isAtStockLimit = hasKnownStock && quantityInCart >= availableStock;
  const stockLimit = hasKnownStock ? availableStock : undefined;
  const actionName = product.name || "product";

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }

    addToCart(product);
  };

  if (quantityInCart > 0) {
    return (
      <div
        className={`${compact ? styles.controlsCompact : styles.controls} ${className}`}
        aria-label={`${actionName} quantity in cart`}
      >
        <button
          type="button"
          className={compact ? styles.controlButtonCompact : styles.controlButton}
          aria-label={`Decrease ${actionName} quantity`}
          onClick={() =>
            updateQuantity(product._id, quantityInCart - 1, stockLimit)
          }
        >
          -
        </button>

        <span className={compact ? styles.controlValueCompact : styles.controlValue}>
          {quantityInCart}
        </span>

        <button
          type="button"
          className={compact ? styles.controlButtonCompact : styles.controlButton}
          aria-label={`Increase ${actionName} quantity`}
          onClick={() =>
            updateQuantity(product._id, quantityInCart + 1, stockLimit)
          }
          disabled={isAtStockLimit}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${compact ? styles.addButtonCompact : styles.addButton} ${className}`}
      onClick={handleAddToCart}
      disabled={authLoading || !cartReady || isOutOfStock || !hasKnownStock}
    >
      {isOutOfStock || !hasKnownStock
        ? outOfStockLabel || (compact ? "Out" : "Out of stock")
        : addLabel || (compact ? "Add" : "Add to cart")}
    </button>
  );
}
