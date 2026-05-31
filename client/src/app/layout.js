import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Authentication state provider
import { AuthProvider } from "@/context/auth-context";
import CartHydrator from "@/components/cart-hydrator";
// Global navigation component
import SiteHeader from "@/components/site-header";

// Configure Geist fonts from Google Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide metadata for SEO and browser tab title
export const metadata = {
  title: "Cartify - E-Commerce Store",
  description: "A Next.js and MERN learning e-commerce project",
};

/**
 * RootLayout wraps all pages with global providers and standard UI elements.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Wrap application with auth context */}
        <AuthProvider>
          <CartHydrator />
          {/* Global Header appears on every page */}
          <SiteHeader />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
