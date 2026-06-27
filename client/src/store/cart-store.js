"use client";

import { create } from "zustand";

const legacyCartStorageKey = "cart";
const cartStorageKeyPrefix = "cart:";

export const getCartTotals = (cart) => {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return { totalItems, totalPrice };
};

const canUseStorage = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const getCartStorageKey = (userId) => `${cartStorageKeyPrefix}${userId}`;

const removeLegacyCartStorage = () => {
  if (!canUseStorage()) {
    return;
  }

  try {
    localStorage.removeItem(legacyCartStorageKey);
  } catch {
    // Ignore storage cleanup failures; they should not block the cart UI.
  }
};

const readStoredCart = (userId) => {
  if (!userId || !canUseStorage()) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(
      localStorage.getItem(getCartStorageKey(userId)) || "[]",
    );

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
};

const writeStoredCart = (userId, cart) => {
  if (!userId || !canUseStorage()) {
    return;
  }

  try {
    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(cart));
  } catch {
    // If browser storage is unavailable, keep the in-memory cart usable.
  }
};

export const useCartStore = create((set) => ({
  cart: [],
  cartReady: false,
  cartOwnerId: null,

  setCartReady: (cartReady) => set({ cartReady }),

  loadCartForUser: (userId) => {
    const nextOwnerId = userId ? String(userId) : null;

    removeLegacyCartStorage();

    set({
      cart: nextOwnerId ? readStoredCart(nextOwnerId) : [],
      cartOwnerId: nextOwnerId,
      cartReady: true,
    });
  },

  addToCart: (product) =>
    set((state) => {
      if (!state.cartOwnerId) {
        return state;
      }

      const availableStock = Number(product.stock);

      if (!Number.isInteger(availableStock) || availableStock < 1) {
        return state;
      }

      const existing = state.cart.find((item) => item.id === product._id);
      const nextCart = existing
        ? state.cart.map((item) =>
            item.id === product._id
              ? {
                  ...item,
                  stock: availableStock,
                  quantity: Math.min(item.quantity + 1, availableStock),
                }
              : item,
          )
        : [
            ...state.cart,
            {
              id: product._id,
              name: product.name,
              price: product.price,
              stock: availableStock,
              quantity: 1,
            },
          ];

      writeStoredCart(state.cartOwnerId, nextCart);
      return { cart: nextCart };
    }),

  addManyToCart: (bundleItems) =>
    set((state) => {
      if (
        !state.cartOwnerId ||
        !Array.isArray(bundleItems) ||
        bundleItems.length === 0
      ) {
        return state;
      }

      const nextCart = state.cart.map((item) => ({ ...item }));

      for (const bundleItem of bundleItems) {
        const product = bundleItem?.product;
        const productId = product?._id;
        const availableStock = Number(product?.stock);

        const requestedQuantity = Math.max(
          1,
          Number.parseInt(bundleItem?.quantity, 10) || 1,
        );

        if (
          !productId ||
          !Number.isInteger(availableStock) ||
          availableStock < 1 ||
          !Number.isFinite(Number(product.price))
        ) {
          continue;
        }

        const existingIndex = nextCart.findIndex(
          (item) => String(item.id) === String(productId),
        );

        if (existingIndex >= 0) {
          const existingItem = nextCart[existingIndex];

          nextCart[existingIndex] = {
            ...existingItem,
            price: Number(product.price),
            stock: availableStock,
            quantity: Math.min(
              existingItem.quantity + requestedQuantity,
              availableStock,
            ),
          };

          continue;
        }

        nextCart.push({
          id: productId,
          name: product.name,
          price: Number(product.price),
          stock: availableStock,
          quantity: Math.min(requestedQuantity, availableStock),
        });
      }

      writeStoredCart(state.cartOwnerId, nextCart);
      return { cart: nextCart };
    }),

  updateQuantity: (id, nextQty, maxStock) =>
    set((state) => {
      if (!state.cartOwnerId) {
        return state;
      }

      const currentItem = state.cart.find((item) => item.id === id);
      const availableStock = Number(maxStock ?? currentItem?.stock);
      let nextCart;

      if (nextQty <= 0) {
        nextCart = state.cart.filter((item) => item.id !== id);
        writeStoredCart(state.cartOwnerId, nextCart);
        return { cart: nextCart };
      }

      // Cap against locally known stock; the backend still verifies stock at checkout.
      if (Number.isInteger(availableStock) && nextQty > availableStock) {
        nextCart = state.cart.map((item) =>
          item.id === id ? { ...item, stock: availableStock } : item,
        );
        writeStoredCart(state.cartOwnerId, nextCart);
        return { cart: nextCart };
      }

      nextCart = state.cart.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: Number.isInteger(availableStock)
                ? availableStock
                : item.stock,
              quantity: nextQty,
            }
          : item,
      );

      writeStoredCart(state.cartOwnerId, nextCart);
      return { cart: nextCart };
    }),

  removeFromCart: (id) =>
    set((state) => {
      if (!state.cartOwnerId) {
        return state;
      }

      const nextCart = state.cart.filter((item) => item.id !== id);

      writeStoredCart(state.cartOwnerId, nextCart);
      return { cart: nextCart };
    }),

  clearCart: () =>
    set((state) => {
      if (!state.cartOwnerId) {
        return { cart: [] };
      }

      writeStoredCart(state.cartOwnerId, []);
      return { cart: [] };
    }),
}));
