# Cartify Client - Next.js Frontend

The Cartify client is a Next.js 16 application for the e-commerce storefront and admin UI. It connects to the Express API, manages auth state, keeps the shopping cart in local storage, and listens for live order status updates.

## Live Deployment

- Frontend: https://cartify-frontend-rouge.vercel.app
- Backend API: https://cartify-backend-lg8z.onrender.com
- Backend health check: https://cartify-backend-lg8z.onrender.com/health

Production environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

## Current Features

### Storefront

- Product catalog with search, category, price filters, sorting, and pagination
- AI shopping assistant panel on the catalog page
- Product cards with stock badges and image fallback UI
- Product detail pages
- Persistent shopping cart using Zustand and localStorage
- Stock-aware add-to-cart and cart quantity controls
- Checkout form with shipping details, shipping method, and fee summary
- User order history and order detail pages
- Live order status updates through Socket.IO

### Authentication

- Register, login, and logout flows
- Auth state managed with React Context
- JWT stored client-side for authenticated API requests
- Admin-only navigation and route checks based on user role

### Admin

- Dashboard with product, order, revenue, active order, and inventory metrics
- Product create, edit, delete, stock, category, and image URL management
- Order list with status filtering
- Order detail pages with admin status updates
- Low-stock and out-of-stock inventory visibility

## Tech Stack

- Next.js 16
- React 19
- Zustand
- Axios
- Socket.IO Client
- CSS Modules
- ESLint

## Project Structure

```text
client/
|-- src/
|   |-- app/
|   |   |-- admin/             # Admin dashboard, products, and orders
|   |   |-- cart/              # Cart page
|   |   |-- checkout/          # Checkout flow
|   |   |-- login/             # Login page
|   |   |-- orders/            # Customer order history and details
|   |   |-- products/          # Product detail pages
|   |   |-- register/          # Registration page
|   |   |-- globals.css
|   |   |-- layout.js
|   |   `-- page.js            # Catalog and AI shopping assistant
|   |-- components/
|   |   |-- cart-hydrator.js
|   |   `-- site-header.js
|   |-- context/
|   |   |-- auth-context.js
|   |   `-- cart-context.js
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
- Backend API running locally on port `5000`, or the live Render API

### Install

```bash
npm install
```

### Environment

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Use this value when deploying to Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

### Run

Development server:

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

The frontend reads the API base URL from `NEXT_PUBLIC_API_BASE_URL`.

Main API areas used by the client:

- `/api/auth` for register, login, and current user
- `/api/products` for catalog, product details, and admin product management
- `/api/orders` for checkout, order history, order details, and admin order updates
- `/api/admin/dashboard` for admin summary metrics
- `/api/ai/shopping-assistant` for catalog recommendations
- `/health` for backend availability checks

## State Management

Cart state is managed by Zustand and persisted to localStorage. Auth state is managed by React Context and provides token, user, and role data to protected pages and API calls.

## Vercel Deployment

Use these Vercel settings:

```text
Root Directory: client
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

Required Vercel environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

After changing environment variables in Vercel, trigger a new deployment.

## Scripts

```bash
npm run dev      # Start the local development server
npm run build    # Build for production
npm start        # Start the production server
npm run lint     # Run ESLint
```

Last updated: June 17, 2026
