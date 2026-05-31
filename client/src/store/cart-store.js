"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const getCartTotals = (cart) => {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return { totalItems, totalPrice };
};

export const useCartStore = create(
  persist(
    (set) => ({
      cart: [],
      cartReady: false,

      setCartReady: (cartReady) => set({ cartReady }),

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product._id);

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                id: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
              },
            ],
          };
        }),

      updateQuantity: (id, nextQty) =>
        set((state) => {
          if (nextQty <= 0) {
            return { cart: state.cart.filter((item) => item.id !== id) };
          }

          return {
            cart: state.cart.map((item) =>
              item.id === id ? { ...item, quantity: nextQty } : item,
            ),
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart",
      partialize: (state) => ({ cart: state.cart }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setCartReady(true);
      },
    },
  ),
);
