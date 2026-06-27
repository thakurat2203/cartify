# Cartify v2 Plan

## Summary

Cartify v2 will upgrade the project from a functional ecommerce app into an AI-powered, production-style commerce platform.

The v2 headline:

```text
Search analytics, transactional emails, and admin intelligence.
```

Recommended build order:

1. Search analytics foundation
2. Email system
3. Admin Analytics v2

## 1. Search Analytics

Track product discovery behavior so the admin dashboard can show real business signals.

Planned work:

- Add a `SearchAnalytics` model.
- Track search keyword, category, min price, max price, sort, stock status, result count, zero-result flag, user ID when available, and timestamp.
- Log analytics from product listing requests.
- Log analytics from future product discovery assistant requests when those features exist.
- Add admin analytics APIs for top searches, zero-result searches, popular categories, and demand signals.

## 2. Email System

Add a reusable transactional email foundation that can serve auth, orders, payments, and security alerts.

Planned work:

- Add SMTP config for Nodemailer.
- Add a reusable `emailService`.
- Add an email log/dedupe model so retries do not send duplicate emails.
- Send registration welcome emails.
- Add email verification emails.
- Add forgot-password and reset-password emails.
- Add login alert emails for sensitive/significant login events.
- Add order/payment transactional emails later, after Razorpay is stable.
- In local development, skip or log emails when SMTP is not configured.

## 3. Admin Analytics v2

Upgrade the admin dashboard from summary metrics into a business dashboard.

Planned analytics:

- Revenue by month
- Revenue by category
- Best-selling products
- Top searched keywords
- Zero-result searches
- Popular categories
- Inventory risk
- Order status trend
- Top customers by order count and value

Implementation notes:

- Use MongoDB aggregation for order, product, user, and search analytics.
- Keep current summary cards.
- Add chart-ready API response shapes.

## Public API Additions

Planned new endpoints:

```text
GET /api/admin/analytics
GET /api/admin/search-analytics
```

Planned auth additions:

```text
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

## Verification Scenarios

Before calling Cartify v2 complete, verify:

- Product searches create analytics records, including zero-result searches.
- Email verification, password reset, login alert, and welcome emails are sent once per intended event.
- Admin dashboard shows revenue, search, inventory, and customer insights.

## Assumptions

- Razorpay is the payment provider.
- Razorpay payment lifecycle is handled separately from this later backlog.
- Nodemailer plus SMTP will be used for the first email implementation.
- Cartify v2 remains login-required for checkout.
- Testing is not a headline v2 feature, but each flow should still be manually verified.
