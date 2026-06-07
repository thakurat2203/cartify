"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { validateEmail, validatePassword } from "@/utils/validation";
import styles from "./page.module.css";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  // Already-authenticated users should not stay on the login screen.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Keep client validation aligned with backend auth rules.
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) {
      setMessage(emailValidation.error);
      return;
    }

    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) {
      setMessage(passwordValidation.error);
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await login({
        email: form.email,
        password: form.password,
      });

      router.push("/");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Login failed";
      setMessage(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <Link href="/" className={styles.backLink}>
          Back to catalog
        </Link>
      </div>

      <div className={styles.card}>
        <p className={styles.eyebrow}>Auth UI</p>

        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtitle}>
          Sign in to continue with your shopping flow.
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <p className={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className={styles.switchLink}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
