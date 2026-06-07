"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "@/utils/validation";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

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

  const handleRegister = async (e) => {
    e.preventDefault();

    // Client validation mirrors the backend and adds password confirmation.
    const nameValidation = validateName(form.name);
    if (!nameValidation.valid) {
      setMessage(nameValidation.error);
      return;
    }

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

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      router.push("/login");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Registration failed";
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

        <h1 className={styles.title}>Register</h1>
        <p className={styles.subtitle}>
          Create your account to continue shopping.
        </p>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

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

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create account"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.switchLink}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
