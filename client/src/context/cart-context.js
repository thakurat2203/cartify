// This file is just for learning purpose, we are not using it in the project, we are using Zustand for state management instead of Context API.


"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

// Create the context for cart data
const CartContext = createContext(null);
const emptySubscribe = () => () => {};

export function CartProvider({ children }) {
  // Initialize cart state from localStorage if available (client-side only)
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Detect if the component has mounted on the client to safely access browser APIs
  const cartReady = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Persist cart changes to localStorage whenever the cart updates
  useEffect(() => {
    if (!cartReady) {
      return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, cartReady]);

  // Add a product to the cart or increment its quantity if it already exists
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product._id);

      if (existing) {
        // Update quantity for existing item
        return prev.map((item) =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // Add new item to array
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

  // Update quantity for a specific item; remove it if quantity is 0 or less
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

  // Remove an item from the cart by its ID
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset the cart to an empty array
  const clearCart = () => {
    setCart([]);
  };

  // Memoize totals to prevent unnecessary recalculations on re-renders
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

  // Context value object containing state and helper methods
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

// Custom hook for easy access to the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}


cart-context.js