"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useCartStore } from "@/store/cart-store";

export default function CartHydrator() {
  const { user, authLoading } = useAuth();
  const loadCartForUser = useCartStore((state) => state.loadCartForUser);
  const setCartReady = useCartStore((state) => state.setCartReady);

  useEffect(() => {
    if (authLoading) {
      setCartReady(false);
      return;
    }

    loadCartForUser(user?.id || null);
  }, [authLoading, loadCartForUser, setCartReady, user?.id]);

  return null;
}
