# Razorpay Payment Lifecycle Plan

## Summary

Replace direct checkout order placement with a verified Razorpay payment lifecycle. Checkout will create a payment-pending internal order, reserve stock with expiry, open Razorpay Checkout, verify payment signatures on the backend, and process Razorpay webhooks idempotently.

Chosen defaults:

- Checkout becomes Razorpay-only.
- Stock is reserved while payment is pending and released on failure/expiry.
- Transactional emails are out of scope for this feature and will be handled later.

## Key Changes

- Add server dependencies:
  - `razorpay` for Orders API and payment/webhook signature helpers.
- Extend `Order` with payment and reservation fields:
  - `paymentStatus`: `pending`, `paid`, `failed`, `refunded`.
  - `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`.
  - `paidAt`, `failedAt`, `refundedAt`, `paymentFailureReason`.
  - `stockReservationStatus`: `reserved`, `confirmed`, `released`.
  - `stockReservedAt`, `stockReservationExpiresAt`, `stockReleasedAt`.
- Add payment APIs:
  - `POST /api/payments/razorpay/order`: validates checkout data, reserves stock, creates internal pending order, creates Razorpay order in INR paise, returns Checkout config.
  - `POST /api/payments/razorpay/verify`: validates `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`; marks the order paid exactly once.
  - `POST /api/payments/razorpay/webhook`: mounted with raw body before `express.json`; validates `X-Razorpay-Signature`; handles duplicate/out-of-order events safely.
- Update order behavior:
  - Disable or remove direct customer order creation through `POST /api/orders`.
  - Keep order listing/detail/admin routes.
  - Prevent fulfillment status changes beyond `placed` unless `paymentStatus === "paid"`.
  - Release reserved stock exactly once for failed or expired pending payments.
- Add reservation expiry:
  - Use a 15-minute default pending-payment window.
  - Add an order service helper that finds expired `pending + reserved` orders, marks them failed, and releases stock.
  - Run this helper on payment-order creation and on a lightweight server interval.
- Update checkout UI:
  - Replace `POST /api/orders` with `POST /api/payments/razorpay/order`.
  - Load `https://checkout.razorpay.com/v1/checkout.js`.
  - Open Razorpay Checkout using backend-returned amount, currency, order id, key id, and prefilled customer info.
  - Send successful Checkout response to `/api/payments/razorpay/verify`.
  - Clear cart and redirect to order details only after backend verification succeeds.
  - Show payment pending/failed messages for modal dismissals or failed attempts.
- Update order UI:
  - Customer order list/detail pages show fulfillment status and payment status separately.
  - Admin order list/detail pages show payment status, Razorpay ids, paid/failed timestamps, and block shipping actions for unpaid orders.
- Update docs and deployment config:
  - Document Razorpay test/live env setup, webhook URL, and manual test flows.

## Files Expected To Change

- Backend:
  - `server/package.json`
  - `server/package-lock.json`
  - `server/.env.example`
  - `server/src/config/index.js`
  - `server/src/index.js`
  - `server/src/models/Order.js`
  - `server/src/models/WebhookEvent.js`
  - `server/src/controllers/orderController.js`
  - `server/src/controllers/paymentController.js`
  - `server/src/routes/orderRoutes.js`
  - `server/src/routes/paymentRoutes.js`
  - `server/src/services/orderService.js`
  - `server/src/services/paymentService.js`
  - `server/src/utils/paymentSignatures.js`
- Frontend:
  - `client/src/app/checkout/page.js`
  - `client/src/app/orders/page.js`
  - `client/src/app/orders/[id]/page.js`
  - `client/src/app/admin/orders/page.js`
  - `client/src/app/admin/orders/[id]/page.js`
  - `client/src/lib/razorpay.js`
  - `client/src/lib/tailwind-styles.js`
- Docs/deployment:
  - `README.md`
  - `server/README.md`
  - `client/README.md`
  - `docs/deployment-cd-guide.md`
  - `docs/production-readiness-checklist.md`
  - `.github/workflows/ci.yml`

## Environment Variables

- Razorpay:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
  - `PAYMENT_RESERVATION_TTL_MINUTES=15`
- Production startup should require Razorpay env. Local startup can continue without Razorpay keys, but payment endpoints should return a clear config error if Razorpay keys are missing.

## Manual Verification Plan

- Manual API checks:
  - Creating a Razorpay order validates server-side totals and reserves stock.
  - Invalid checkout signature is rejected.
  - Valid checkout signature marks the order paid once.
  - Duplicate `payment.captured` or `order.paid` webhook returns success without duplicate updates.
  - `payment.failed` releases stock once.
  - Expired pending order releases stock once.
- Frontend checks:
  - Checkout opens Razorpay Checkout.
  - Successful test payment clears cart and redirects to order detail.
  - Payment dismiss/failure leaves a clear message and does not mark paid.
  - Customer/admin order screens show payment status separately from fulfillment status.
- Existing checks:
  - `cd client && npm run lint`
  - `cd client && npm run build`
  - CI should install server/client deps, run client lint/build, and keep Docker builds green.

## Assumptions

- Currency remains INR and backend amounts are converted to paise.
- Application-initiated refunds are not part of this feature; `refunded` fields are added for future compatibility only.
- Webhooks are the final source of truth, while frontend verification gives fast confirmation after Checkout success.
- Pending unpaid orders may appear in order history until they are paid or expired.
- Razorpay Dashboard must be configured with the webhook URL: `/api/payments/razorpay/webhook`.
- Transactional emails are intentionally postponed to a later email feature.

## References

- Razorpay Node.js server integration: https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/
- Razorpay Standard Checkout: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- Razorpay webhook validation/idempotency: https://razorpay.com/docs/webhooks/validate-test/
