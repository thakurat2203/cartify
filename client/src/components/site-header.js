"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getCartTotals, useCartStore } from "@/store/cart-store";
import { siteHeaderStyles as styles } from "@/lib/tailwind-styles";

export default function SiteHeader() {
  // Header reads shared cart/auth state to keep navigation in sync everywhere.
  const cart = useCartStore((state) => state.cart);
  const cartReady = useCartStore((state) => state.cartReady);
  const { totalItems } = getCartTotals(cart);
  const { user, isAuthenticated, logout, authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          Cartify
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>

        <nav
          id="site-navigation"
          className={`${styles.nav} ${
            isMenuOpen ? styles.navOpen : styles.navClosed
          }`}
        >
          <Link href="/" className={styles.navLink} onClick={closeMenu}>
            Catalog
          </Link>
          <Link href="/cart" className={styles.navLink} onClick={closeMenu}>
            Cart ({cartReady ? totalItems : "..."})
          </Link>

          {/* Avoid showing guest/admin links until the stored session has been checked. */}
          {authLoading ? (
            <span className={styles.userPill}>Checking session...</span>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/account"
                className={styles.navLink}
                onClick={closeMenu}
              >
                Account
              </Link>
              <Link
                href="/orders"
                className={styles.navLink}
                onClick={closeMenu}
              >
                My Orders
              </Link>

              {user?.role === "admin" && (
                <>
                  <Link
                    href="/admin"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Admin Products
                  </Link>
                  <Link
                    href="/admin/orders"
                    className={styles.navLink}
                    onClick={closeMenu}
                  >
                    Admin Orders
                  </Link>
                </>
              )}

              <span className={styles.userPill}>Hi, {user?.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.navLink} onClick={closeMenu}>
                Login
              </Link>
              <Link
                href="/register"
                className={styles.registerLink}
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
