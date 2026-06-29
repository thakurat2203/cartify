# Cartify Client - Next.js Frontend

The Cartify client is a Next.js 16 app for the ecommerce storefront, checkout, customer orders, account screens, and admin UI. It uses same-origin `/api/*` requests, and Next.js rewrites those requests to the Express backend.

## Live Deployment

- Frontend: https://cartify-frontend-rouge.vercel.app
- Backend API: https://cartify-backend-lg8z.onrender.com
- Backend health check: https://cartify-backend-lg8z.onrender.com/health

Production API proxy target:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

Browser requests stay on the frontend origin at `/api/*`. This keeps HTTP-only auth cookies first-party while the backend still runs on Render.

## Features

### Storefront

- Product catalog with search, category, price, stock, sorting, and pagination filters.
- Product cards and product detail pages with image fallback UI.
- AI shopping assistant panel for recommendations and budget bundles.
- Persistent Zustand cart with localStorage persistence.
- Stock-aware add-to-cart and quantity controls.
- Razorpay test-mode checkout.
- Customer order list and order details.
- Live order status updates through Socket.IO.

### Authentication

- Register, login, logout, refresh, and session restore.
- Auth state managed with React Context.
- API calls use `withCredentials` so HTTP-only cookies are sent.
- Admin navigation and page access are based on authenticated user role.

### Admin

- Dashboard metrics.
- Product create, edit, delete, stock, category, and image URL management.
- Order list and order details with payment and fulfillment status.
- Fulfillment controls blocked for unpaid orders.

## Tech Stack

- Next.js 16
- React 19
- Zustand
- Axios
- Socket.IO Client
- Tailwind CSS classes
- ESLint

## Project Structure

```text
client/
|-- src/
|   |-- app/
|   |   |-- admin/             # Admin dashboard, products, and orders
|   |   |-- cart/              # Cart page
|   |   |-- checkout/          # Razorpay checkout flow
|   |   |-- login/             # Login page
|   |   |-- orders/            # Customer order history and details
|   |   |-- products/          # Product detail pages
|   |   |-- register/          # Registration page
|   |   |-- globals.css
|   |   |-- layout.js
|   |   `-- page.js            # Catalog and AI assistant
|   |-- components/
|   |   |-- cart-hydrator.js
|   |   |-- product-cart-action.js
|   |   `-- site-header.js
|   |-- context/
|   |   `-- auth-context.js
|   |-- lib/
|   |   |-- api.js
|   |   |-- razorpay.js
|   |   `-- tailwind-styles.js
|   |-- store/
|   |   `-- cart-store.js
|   `-- utils/
|       `-- validation.js
|-- package.json
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 20.9+
- npm
- Backend running locally on port `5000`, or a live Render backend URL

### Install

```bash
npm install
```

### Environment

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Use this value on Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

### Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

The local app runs at http://localhost:3000.

## API Usage

The frontend calls same-origin `/api/*` routes. `NEXT_PUBLIC_API_BASE_URL` configures the Next.js rewrite destination for those requests.

Main API areas:

- `/api/auth` for register, login, refresh, logout, and current user.
- `/api/products` for catalog, product details, and admin product management.
- `/api/payments/razorpay` for creating and verifying Razorpay test-mode payments.
- `/api/orders` for order history, order details, and admin fulfillment updates.
- `/api/admin/dashboard` for admin summary metrics.
- `/api/ai/shopping-assistant` for simple recommendations.
- `/api/ai/cart-builder` for budget-aware bundles.
- `/health` for backend availability checks.

## State Management

- Auth state uses React Context.
- API credentials are HTTP-only cookies managed by the backend.
- Cart state uses Zustand and localStorage.
- Cart is cleared only after the backend verifies a Razorpay payment.

## Vercel Deployment

Use these Vercel settings:

```text
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Required Vercel environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

After changing this environment variable, trigger a new frontend deployment.

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

Last updated: June 30, 2026
