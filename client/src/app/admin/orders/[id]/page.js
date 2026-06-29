"use client";

import api from "@/lib/api";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { adminOrderDetailStyles as styles } from "@/lib/tailwind-styles";

const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAID_ONLY_STATUSES = ["processing", "shipped", "delivered"];

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "";

const formatShippingMethod = (method) => {
  if (method === "express") {
    return "Express delivery";
  }

  return "Standard delivery";
};

export default function AdminOrderDetailsPage({ params }) {
  const { id } = use(params);
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Admin screens must wait for auth hydration before enforcing role access.
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.push("/");
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);

        setOrder(response.data.order);
        setStatusDraft(response.data.order.status);
      } catch (err) {
        const apiMessage =
          err.response?.data?.message || err.message || "Failed to load order";
        setMessage(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated && user?.role === "admin") {
      loadOrder();
    }
  }, [authLoading, id, isAuthenticated, router, user]);

  // The dropdown edits draft state only; the update button persists the selected status.
  const handleStatusChange = (e) => {
    setStatusDraft(e.target.value);
  };

  const handleStatusUpdate = async () => {
    const nextStatus = statusDraft || order.status;
    const blocksFulfillment =
      order.paymentStatus !== "paid" && PAID_ONLY_STATUSES.includes(nextStatus);

    if (blocksFulfillment) {
      setMessage("Payment must be paid before fulfillment can start.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await api.put(
        `/api/orders/${id}/status`,
        { status: nextStatus },
      );

      setOrder(response.data.order);
      setStatusDraft(response.data.order.status);
      setMessage(response.data.message || "Status updated successfully.");
    } catch (err) {
      const apiMessage =
        err.response?.data?.message || err.message || "Failed to update status";
      setMessage(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>Admin Order Details</h1>
          <p className={styles.message}>Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.backRow}>
          <Link href="/admin/orders" className={styles.backLink}>
            Back to admin orders
          </Link>
        </div>

        <h1 className={styles.title}>Admin Order Details</h1>

        {message && <p className={styles.message}>{message}</p>}

        {order && (
          <div className={styles.card}>
            {(() => {
              const selectedStatus = statusDraft || order.status;
              const blocksFulfillment =
                order.paymentStatus !== "paid" &&
                PAID_ONLY_STATUSES.includes(selectedStatus);

              return (
                <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Order Info</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Order ID:</strong>
                <span className={styles.value}>{order._id}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Fulfillment status:</strong>
                <span
                  className={`${styles.badge} ${styles[`status-${order.status}`]}`}
                >
                  {formatStatus(order.status)}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Placed on:</strong>
                <span className={styles.value}>
                  {formatDateTime(order.createdAt)}
                </span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Payment status:</strong>
                <span className={styles.value}>
                  {formatStatus(order.paymentStatus)}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Reservation:</strong>
                <span className={styles.value}>
                  {formatStatus(order.stockReservationStatus)}
                </span>
              </p>
              {order.razorpayOrderId && (
                <p className={styles.row}>
                  <strong className={styles.label}>Razorpay order:</strong>
                  <span className={styles.value}>{order.razorpayOrderId}</span>
                </p>
              )}
              {order.razorpayPaymentId && (
                <p className={styles.row}>
                  <strong className={styles.label}>Razorpay payment:</strong>
                  <span className={styles.value}>
                    {order.razorpayPaymentId}
                  </span>
                </p>
              )}
              {order.paidAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Paid on:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.paidAt)}
                  </span>
                </p>
              )}
              {order.failedAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Failed on:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.failedAt)}
                  </span>
                </p>
              )}
              {order.paymentFailureReason && (
                <p className={styles.row}>
                  <strong className={styles.label}>Failure reason:</strong>
                  <span className={styles.value}>
                    {order.paymentFailureReason}
                  </span>
                </p>
              )}
              {order.stockReservedAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Reserved on:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.stockReservedAt)}
                  </span>
                </p>
              )}
              {order.stockReservationExpiresAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Reservation expires:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.stockReservationExpiresAt)}
                  </span>
                </p>
              )}
              {order.stockReleasedAt && (
                <p className={styles.row}>
                  <strong className={styles.label}>Stock released on:</strong>
                  <span className={styles.value}>
                    {formatDateTime(order.stockReleasedAt)}
                  </span>
                </p>
              )}
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Customer</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Name:</strong>
                <span className={styles.value}>{order.user?.name}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Email:</strong>
                <span className={styles.value}>{order.user?.email}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Role:</strong>
                <span className={styles.value}>{order.user?.role}</span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping Info</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Full name:</strong>
                <span className={styles.value}>
                  {order.shippingInfo.fullName}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Email:</strong>
                <span className={styles.value}>{order.shippingInfo.email}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Phone:</strong>
                <span className={styles.value}>{order.shippingInfo.phone}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Address:</strong>
                <span className={styles.value}>
                  {order.shippingInfo.addressLine1}
                  {order.shippingInfo.addressLine2 &&
                    `, ${order.shippingInfo.addressLine2}`}
                  , {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
                  {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                </span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Shipping:</strong>
                <span className={styles.value}>
                  {formatShippingMethod(order.shippingMethod)}
                </span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Items</h2>
              <ul className={styles.items}>
                {order.orderItems.map((item) => (
                  <li
                    key={`${item.product}-${item.name}`}
                    className={styles.item}
                  >
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.value}>Qty: {item.quantity}</p>
                    <p className={styles.value}>Price: Rs. {item.price}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Summary</h2>
              <p className={styles.row}>
                <strong className={styles.label}>Total items:</strong>
                <span className={styles.value}>{order.totalItems}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Subtotal:</strong>
                <span className={styles.value}>Rs. {order.subtotal}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Shipping fee:</strong>
                <span className={styles.value}>Rs. {order.shippingFee}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Platform fee:</strong>
                <span className={styles.value}>Rs. {order.platformFee}</span>
              </p>
              <p className={styles.row}>
                <strong className={styles.label}>Total price:</strong>
                <span className={styles.value}>Rs. {order.totalPrice}</span>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Manage Status</h2>
              <div className={styles.statusControls}>
                <select
                  className={styles.select}
                  value={statusDraft || order.status}
                  onChange={handleStatusChange}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleStatusUpdate}
                  disabled={
                    saving ||
                    selectedStatus === order.status ||
                    blocksFulfillment
                  }
                >
                  {saving ? "Saving..." : "Update Status"}
                </button>
              </div>
              {blocksFulfillment && (
                <p className={styles.message}>
                  Payment must be paid before fulfillment can start.
                </p>
              )}
            </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
