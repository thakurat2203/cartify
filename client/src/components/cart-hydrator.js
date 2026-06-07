"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export default function CartHydrator() {
  useEffect(() => {
    // Zustand persistence is skipped during SSR and restored after the client mounts.
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
