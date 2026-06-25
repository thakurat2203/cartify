"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import styles from "./site-header.module.css";

export default function SiteHeader() {
  // Header reads shared cart/auth state to keep navigation in sync everywhere.
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const { totalItems } = getCartTotals(cart);
  const { user, isAuthenticated, logout, authLoading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Cartify
        </Link>

        <nav className={styles.nav}>
          <Link href="/">Catalog</Link>
          <Link href="/cart">Cart ({cartReady ? totalItems : "..."})</Link>

          {/* Avoid showing guest/admin links until the stored session has been checked. */}
          {authLoading ? (
            <span className={styles.userPill}>Checking session...</span>
          ) : isAuthenticated ? (
            <>
              <Link href="/account">Account</Link>
              <Link href="/orders">My Orders</Link>

              {user?.role === "admin" && (
                <>
                  <Link href="/admin">Admin Dashboard</Link>
                  <Link href="/admin/products">Admin Products</Link>
                  <Link href="/admin/orders">Admin Orders</Link>
                </>
              )}

              <span className={styles.userPill}>Hi, {user?.name}</span>
              <button
                type="button"
                onClick={logout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className={styles.registerLink}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
