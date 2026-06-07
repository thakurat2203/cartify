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
          const availableStock = Number(product.stock);

          if (!Number.isInteger(availableStock) || availableStock < 1) {
            return state;
          }

          const existing = state.cart.find((item) => item.id === product._id);

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product._id
                  ? {
                      ...item,
                      stock: availableStock,
                      quantity: Math.min(item.quantity + 1, availableStock),
                    }
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
                stock: availableStock,
                quantity: 1,
              },
            ],
          };
        }),

      updateQuantity: (id, nextQty, maxStock) =>
        set((state) => {
          const currentItem = state.cart.find((item) => item.id === id);
          const availableStock = Number(maxStock ?? currentItem?.stock);

          if (nextQty <= 0) {
            return { cart: state.cart.filter((item) => item.id !== id) };
          }

          // Cap against locally known stock; the backend still verifies stock at checkout.
          if (Number.isInteger(availableStock) && nextQty > availableStock) {
            return {
              cart: state.cart.map((item) =>
                item.id === id ? { ...item, stock: availableStock } : item,
              ),
            };
          }

          return {
            cart: state.cart.map((item) =>
              item.id === id
                ? {
                    ...item,
                    stock: Number.isInteger(availableStock)
                      ? availableStock
                      : item.stock,
                    quantity: nextQty,
                  }
                : item,
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
      // Hydrate manually so server-rendered markup never disagrees with localStorage.
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setCartReady(true);
      },
    },
  ),
);
