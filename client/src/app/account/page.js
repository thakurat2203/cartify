"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  validateAddressLine,
  validateCity,
  validateCountry,
  validateName,
  validatePassword,
  validatePhone,
  validatePostalCode,
  validateState,
} from "@/utils/validation";
import { accountStyles as styles } from "@/lib/tailwind-styles";

const initialAddressForm = {
  label: "Home",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

const initialPasswordForm = {
  currentPassword: "",
  newPassword: "",
};

const validateOptionalPhone = (phone) => {
  if (!phone.trim()) {
    return { valid: true };
  }

  return validatePhone(phone);
};

const validateAddressForm = (addressForm) => {
  const validations = [
    validateAddressLine(addressForm.addressLine1),
    validateAddressLine(addressForm.addressLine2, false),
    validateCity(addressForm.city),
    validateState(addressForm.state),
    validatePostalCode(addressForm.postalCode),
    validateCountry(addressForm.country),
  ];

  return validations.find((validation) => !validation.valid);
};

const buildAddressPayload = (address, isDefault = address.isDefault) => ({
  label: address.label,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault,
});

const formatAddress = (address) =>
  [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

export default function AccountPage() {
  const router = useRouter();
  const { user, authLoading, isAuthenticated, updateUser, clearUser } =
    useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
    });
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Account</h1>
          <p className={styles.message}>Loading account...</p>
        </div>
      </div>
    );
  }

  const addresses = Array.isArray(user.addresses) ? user.addresses : [];

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const nameValidation = validateName(profileForm.name);
    if (!nameValidation.valid) {
      setProfileError(nameValidation.error);
      setProfileMessage("");
      return;
    }

    const phoneValidation = validateOptionalPhone(profileForm.phone);
    if (!phoneValidation.valid) {
      setProfileError(phoneValidation.error);
      setProfileMessage("");
      return;
    }

    try {
      setProfileSubmitting(true);
      setProfileError("");
      setProfileMessage("");

      const response = await api.patch("/api/auth/me/profile", {
        name: profileForm.name,
        phone: profileForm.phone,
      });

      updateUser(response.data.user);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to update profile";
      setProfileError(apiMessage);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, type, checked, value } = e.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm(initialAddressForm);
    setEditingAddressId("");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    const failedValidation = validateAddressForm(addressForm);
    if (failedValidation) {
      setAddressError(failedValidation.error);
      setAddressMessage("");
      return;
    }

    try {
      setAddressSubmitting(true);
      setAddressError("");
      setAddressMessage("");

      const payload = buildAddressPayload(addressForm);
      const response = editingAddressId
        ? await api.put(`/api/auth/me/addresses/${editingAddressId}`, payload)
        : await api.post("/api/auth/me/addresses", payload);

      updateUser(response.data.user);
      resetAddressForm();
      setAddressMessage(
        editingAddressId
          ? "Address updated successfully."
          : "Address added successfully.",
      );
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to save address";
      setAddressError(apiMessage);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm(buildAddressPayload(address));
    setAddressError("");
    setAddressMessage("");
  };

  const handleSetDefaultAddress = async (address) => {
    try {
      setAddressSubmitting(true);
      setAddressError("");
      setAddressMessage("");

      const response = await api.put(
        `/api/auth/me/addresses/${address.id}`,
        buildAddressPayload(address, true),
      );

      updateUser(response.data.user);
      setAddressMessage("Default address updated.");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update default address";
      setAddressError(apiMessage);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setAddressSubmitting(true);
      setAddressError("");
      setAddressMessage("");

      const response = await api.delete(`/api/auth/me/addresses/${addressId}`);

      updateUser(response.data.user);
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      setAddressMessage("Address deleted successfully.");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to delete address";
      setAddressError(apiMessage);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error);
      return;
    }

    try {
      setPasswordSubmitting(true);
      setPasswordError("");

      await api.patch("/api/auth/me/password", passwordForm);

      clearUser();
      router.replace("/login");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to update password";
      setPasswordError(apiMessage);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.headerRow}>
          <div>
            <p className={styles.eyebrow}>Cartify Account</p>
            <h1 className={styles.title}>Account Details</h1>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profile</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldWide}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  value={user.email}
                  disabled
                  className={`${styles.input} ${styles.readOnlyInput}`}
                />
              </div>

              <button
                type="submit"
                className={styles.profileSubmitButton}
                disabled={profileSubmitting}
              >
                {profileSubmitting ? "Saving..." : "Save profile"}
              </button>

              {profileError && <p className={styles.error}>{profileError}</p>}
              {profileMessage && (
                <p className={styles.success}>{profileMessage}</p>
              )}
            </form>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Security</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="currentPassword">Current password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                />
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={passwordSubmitting}
              >
                {passwordSubmitting ? "Updating..." : "Change password"}
              </button>

              {passwordError && <p className={styles.error}>{passwordError}</p>}
            </form>
          </section>
        </div>

        <section className={`${styles.card} ${styles.addressSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Addresses</h2>
          </div>

          <div className={styles.addressGrid}>
            <form onSubmit={handleAddressSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="label">Label</label>
                <input
                  id="label"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldWide}>
                <label htmlFor="addressLine1">Address line 1</label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldWide}>
                <label htmlFor="addressLine2">Address line 2</label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="postalCode">Postal code</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  value={addressForm.postalCode}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  className={styles.input}
                />
              </div>

              <label className={styles.checkboxRow}>
                <input
                  name="isDefault"
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={handleAddressChange}
                />
                <span>Default address</span>
              </label>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={addressSubmitting}
                >
                  {addressSubmitting
                    ? "Saving..."
                    : editingAddressId
                      ? "Save address"
                      : "Add address"}
                </button>

                {editingAddressId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={resetAddressForm}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {addressError && <p className={styles.error}>{addressError}</p>}
              {addressMessage && (
                <p className={styles.success}>{addressMessage}</p>
              )}
            </form>

            <div className={styles.addressList}>
              {addresses.length === 0 ? (
                <p className={styles.emptyState}>No saved addresses yet.</p>
              ) : (
                addresses.map((address) => (
                  <article key={address.id} className={styles.addressCard}>
                    <div className={styles.addressHeader}>
                      <h3>{address.label || "Address"}</h3>
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </div>

                    <p className={styles.addressText}>
                      {formatAddress(address)}
                    </p>

                    <div className={styles.addressActions}>
                      {!address.isDefault && (
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() => handleSetDefaultAddress(address)}
                          disabled={addressSubmitting}
                        >
                          Set default
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => handleEditAddress(address)}
                        disabled={addressSubmitting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={addressSubmitting}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className={styles.ordersCard}>
          <div>
            <h2 className={styles.sectionTitle}>Orders</h2>
            <p className={styles.ordersText}>
              View order number, items, total amount, status, and date.
            </p>
          </div>
          <Link href="/orders" className={styles.primaryLink}>
            View orders
          </Link>
        </section>
      </div>
    </div>
  );
}
