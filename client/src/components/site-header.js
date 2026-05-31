"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import styles from "./site-header.module.css";

/**
 * SiteHeader provides the global navigation bar, including branding,
 * cart status, and user-specific authentication links.
 */
export default function SiteHeader() {
  // Retrieve cart state from Zustand and auth state from context
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const { totalItems } = getCartTotals(cart);
  const { user, isAuthenticated, logout, authLoading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Main Branding Link */}
        <Link href="/" className={styles.brand}>
          🛒 Cartify
        </Link>

        <nav className={styles.nav}>
          <Link href="/">Catalog</Link>
          {/* Display cart count only when client-side storage is ready */}
          <Link href="/cart">Cart ({cartReady ? totalItems : "..."})</Link>

          {authLoading ? (
            <span className={styles.userPill}>Checking session...</span>
          ) : isAuthenticated ? (
            <>
              {/* Regular Customer Links */}
              <Link href="/orders">My Orders</Link>
              
              {/* Admin-Only Management Links */}
              {user?.role === "admin" && (
                <>
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
              {/* Guest Access Links */}
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
