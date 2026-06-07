"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

// Legacy cart context kept as a learning reference; the app uses the Zustand store.
const CartContext = createContext(null);
const emptySubscribe = () => () => {};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Wait for the browser before syncing localStorage to avoid hydration mismatch.
  const cartReady = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, cartReady]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product._id);

      if (existing) {
        return prev.map((item) =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, nextQty) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: nextQty } : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totals = useMemo(() => {
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return { totalItems, totalPrice };
  }, [cart]);

  const value = {
    cart,
    cartReady,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems: totals.totalItems,
    totalPrice: totals.totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
