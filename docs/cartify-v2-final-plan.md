# Cartify v2 Final Plan

## Summary

Cartify v2 will focus on four product features followed by one interview-preparation deliverable:

1. Security Foundation - P0
2. Razorpay Payments and Emails - P0
3. AI Cart Builder - P1
4. SEO-Ready Product Pages - P1
5. Cartify Interview Preparation File - P1

Each phase must pass its acceptance checks before the next begins. Search Analytics, the Notification Center, and Admin Analytics v2 are deferred to the later plan.

## 1. Security Foundation

Replace the current browser-stored JWT authentication with a production-style cookie-based session system before introducing payments.

### Authentication and sessions

- Replace `localStorage` JWTs with HTTP-only access and refresh cookies.
- Use 15-minute access tokens and 30-day refresh sessions.
- Store hashed refresh tokens in MongoDB.
- Rotate refresh tokens whenever a session is refreshed.
- Revoke expired, reused, or logged-out refresh sessions.
- Configure production cookies as `HttpOnly`, `Secure`, and `SameSite=None`.
- Validate allowed origins for state-changing requests.
- Update frontend requests to use `withCredentials: true`.
- Authenticate existing Socket.IO order rooms using cookies instead of browser-visible tokens.

### Account security

- Add email verification using a single-use token that expires after 24 hours.
- Prevent unverified new accounts from logging in.
- Migrate existing users as verified so the upgrade does not lock them out.
- Add password reset using a single-use, hashed token that expires after 30 minutes.
- Apply route-specific rate limits to login, registration, refresh, verification, resend-verification, forgot-password, and reset-password routes.

### Audit logs and email service

- Add an immutable `AuditLog` model.
- Record authentication-sensitive events, admin product changes, order status changes, payment actions, and other admin actions.
- Add a shared Nodemailer SMTP service for verification, password-reset, payment, and order emails.

### Auth API

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Login and refresh responses return the authenticated user but never expose access or refresh tokens.

### Completion checks

- A user can register, verify their email, log in, restore their session, refresh it, and log out.
- Refresh-token rotation rejects reuse of an older token.
- Expired verification and password-reset tokens are rejected.
- Protected customer and admin routes work without Authorization headers.
- Existing live order updates continue to work through cookie-authenticated Socket.IO connections.

## 2. Razorpay Payments and Emails

Replace direct order placement with a verified Razorpay payment lifecycle.

### Order and payment data

Extend orders with:

- `paymentStatus`: `pending`, `paid`, `failed`, or `refunded`
- `razorpayOrderId`
- `razorpayPaymentId`
- `razorpaySignature`
- `paidAt`
- `failedAt`
- `refundedAt`
- Stock reservation status and expiry

Keep fulfillment status separate from payment status.

### Checkout flow

1. Validate shipping data, cart products, quantities, stock, and totals on the server.
2. Atomically reserve the required stock.
3. Create an internal order with `paymentStatus: pending`.
4. Create a Razorpay order in INR using the server-calculated amount in paise.
5. Return the Razorpay Checkout configuration to the frontend.
6. Open Razorpay Checkout from the checkout page.
7. Verify the returned checkout signature on the server.
8. Mark the payment successful only after verification.

Remove direct customer order creation so checkout cannot bypass payment.

### Webhooks and failure handling

- Mount the Razorpay webhook before the normal JSON parser so its raw request body is preserved.
- Verify the `x-razorpay-signature` header.
- Handle `payment.captured`, `payment.failed`, and `order.paid` events.
- Store processed webhook IDs so repeated events are idempotent.
- Treat verified webhooks as the final payment source of truth.
- Release reserved stock exactly once when a payment fails or expires.
- Ensure frontend verification and webhook delivery can arrive in either order without duplicate updates.

### Transactional emails

Send idempotent emails for:

- Order placed with payment pending
- Payment successful
- Payment failed
- Admin order-status changes

### Payment API

```text
POST /api/payments/razorpay/order
POST /api/payments/razorpay/verify
POST /api/payments/razorpay/webhook
```

Order creation response:

```json
{
  "order": {},
  "razorpayOrder": {
    "id": "order_xxx",
    "amount": 10000,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  }
}
```

### Completion checks

- Browser prices or totals cannot override server-calculated values.
- Valid Razorpay payments update the order exactly once.
- Invalid checkout and webhook signatures are rejected.
- Failed and expired payments release stock exactly once.
- Duplicate or out-of-order webhook delivery is safe.
- Payment and order emails are not duplicated.

## 3. AI Cart Builder

Extend the existing AI assistant with a budget-aware bundle mode while keeping simple product recommendations active in the same storefront panel.

Example request:

```text
Build me an office setup under 5000
```

### Backend behavior

- Add `POST /api/ai/cart-builder`.
- Accept a message of up to 300 characters.
- Use Gemini to extract structured intent: budget, use case, requested categories, and preferences.
- Select products deterministically from the live database so Gemini cannot invent product names or prices.
- Include only in-stock products.
- Never exceed the requested budget.
- Use the existing local fallback approach when Gemini is unavailable.
- Apply a dedicated AI rate limit.
- Use the existing shopping-assistant endpoint for simple product and category requests.
- Automatically send setup, kit, essentials, and use-case-plus-budget requests to the cart-builder endpoint.

### Response

```json
{
  "source": "gemini",
  "budget": 5000,
  "items": [
    {
      "product": {},
      "quantity": 1,
      "reason": "Suitable for office productivity"
    }
  ],
  "totalPrice": 4598,
  "remainingBudget": 402,
  "skippedCategories": []
}
```

### Frontend behavior

- Upgrade the existing panel to support recommendation and bundle modes automatically.
- Show matching products with individual cart actions for simple requests such as `mouse`.
- Show selected products, reasons, total price, remaining budget, skipped categories, and whether Gemini or the fallback produced the bundle.
- Add an **Add all to cart** action.
- Add an atomic `addManyToCart` store action that respects stock and existing cart quantities.

### Completion checks

- Plain product requests continue to return recommendations without requiring a budget.
- Setup requests use the bundle response and require a total budget.
- Gemini and fallback modes produce the same response shape.
- Bundle totals are calculated from current database prices.
- Bundles never exceed the requested budget.
- Insufficient budgets and unavailable categories are explained.
- Adding the full bundle respects current stock and cart quantities.

## 4. SEO-Ready Product Pages

Make product pages server-rendered, indexable, shareable, and accessible through stable URLs.

### Product data and migration

- Add a unique indexed `slug`.
- Add `seoTitle`, `seoDescription`, and optional `seoKeywords`.
- Generate a stable slug when a product is created.
- Do not silently change an existing slug when the product name changes.
- Backfill unique slugs for existing products before changing storefront links.
- Keep ID-based product APIs for admin and legacy compatibility.

### Product pages

- Convert `/products/[slug]` into a server-rendered page.
- Redirect legacy `/products/[id]` requests to the canonical slug URL.
- Generate dynamic title and description metadata.
- Add canonical URLs and Open Graph title, description, and image data.
- Add Product JSON-LD.
- Add dynamic `sitemap.js` and `robots.js` files.
- Configure `SITE_URL` and a server-side API base URL.

### Product images

- Restrict product images to configured HTTPS hosts.
- Initially allow `images.unsplash.com` for the seeded catalog.
- Replace unsafe raw remote image rendering with `next/image` and retain a fallback state.

### Product API

```text
GET /api/products/slug/:slug
GET /api/products/sitemap
```

### Completion checks

- Every product has a unique, stable slug.
- Product content is present in the initial server response.
- Old ID links redirect to the correct canonical URL.
- Metadata, Open Graph fields, canonical URLs, and JSON-LD reflect the product.
- Every product appears in the sitemap.
- Invalid or unavailable remote images use a safe fallback.

## 5. Cartify Interview Preparation File

Create `docs/cartify-interview-preparation.md` after the product features are complete so it accurately reflects the final project.

### Content

- A 30-second and 2-minute Cartify project introduction.
- Architecture, technology choices, request flows, and database models.
- Clear explanations of authentication, Razorpay payments, AI cart building, SEO, real-time updates, testing, deployment, and CI/CD.
- Important engineering decisions, tradeoffs, security measures, challenges, bugs solved, and possible future improvements.
- Common project-specific interview questions with concise answers.
- Resume-ready project points and STAR-format stories based on the actual implementation work.

### Completion checks

- Every claim matches the completed code and deployed architecture.
- Explanations are understandable without reading the repository.
- Answers cover both high-level design and important implementation details.
- The file includes quick revision sections for last-minute interview preparation.

## Verification Strategy

- Add backend integration tests for authentication, payment signatures, webhooks, stock handling, AI bundle rules, and slug behavior.
- Add the backend test command to CI.
- Retain frontend lint and production-build checks.
- Test checkout with Razorpay test credentials and test payment scenarios.
- Verify SMTP delivery for account and order emails.
- Perform final browser testing of all four feature flows on desktop and mobile layouts.

## Assumptions

- Cartify v2 remains login-required for checkout.
- Razorpay uses INR and server-calculated amounts in paise.
- Nodemailer with SMTP handles transactional email.
- The roadmap targets a polished portfolio project with production-style safety.
- Search Analytics, the Notification Center, Admin Analytics v2, and application-initiated refunds remain deferred.
