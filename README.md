# Cartify - Full Stack E-Commerce Showcase

[![CI](https://github.com/thakurat2203/cartify/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thakurat2203/cartify/actions/workflows/ci.yml)

Cartify is a production-inspired ecommerce demo built with Next.js, Express, MongoDB, cookie-based authentication, Razorpay test-mode checkout, admin workflows, live order updates, and an AI shopping assistant.

The project is designed for portfolio/interview use. Razorpay runs in test mode only; no live money is handled.

## Live Deployment

| Service | Platform | URL |
| --- | --- | --- |
| Frontend | Vercel | https://cartify-frontend-rouge.vercel.app |
| Backend API | Render | https://cartify-backend-lg8z.onrender.com |
| Health Check | Render | https://cartify-backend-lg8z.onrender.com/health |

The browser calls same-origin `/api/*` routes. Next.js rewrites those requests to the backend configured by:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

The backend allows the deployed frontend origin through:

```env
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

## Features

### Customer

- Register, login, logout, session restore, and cookie-based refresh.
- Product catalog with search, category, price, stock, sorting, and pagination filters.
- Product details with image fallback UI.
- Persistent Zustand cart with stock-aware quantity controls.
- AI shopping assistant for product recommendations and budget-based bundles.
- Razorpay test-mode checkout with backend signature verification.
- Customer order history and order detail pages.
- Live order status updates through Socket.IO.

### Payment Lifecycle

- Backend calculates totals from MongoDB product prices.
- Checkout reserves stock before opening Razorpay.
- Backend creates a Razorpay order in INR paise.
- Frontend verifies payment through `/api/payments/razorpay/verify`.
- Paid orders confirm the stock reservation.
- Unpaid pending orders expire after `PAYMENT_RESERVATION_TTL_MINUTES`.
- Expired pending orders become failed/cancelled and release stock.
- Admin fulfillment is blocked until payment is paid.

### Admin

- Role-protected admin dashboard.
- Product create, edit, delete, stock, category, and image management.
- Order list and order detail screens with payment and fulfillment state.
- Status updates for paid orders.
- Low-stock and out-of-stock visibility.

### AI Assistant

- `shopping-assistant` handles simple product/category requests.
- `cart-builder` handles setup/budget requests.
- Gemini is used when configured.
- Local fallback parsing keeps the feature usable without Gemini.
- Final recommendations always come from live database products.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Zustand
- Axios
- Socket.IO Client
- Tailwind CSS classes

### Backend

- Node.js 20.9+
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens in HTTP-only cookies
- Razorpay SDK
- bcryptjs
- Helmet, Morgan, express-rate-limit
- Gemini API with local fallback parsing

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas or compatible MongoDB

## Project Structure

```text
e-commerce/
|-- client/                  # Next.js frontend
|   |-- src/
|   |   |-- app/             # App Router pages
|   |   |-- components/      # Shared UI components
|   |   |-- context/         # Auth context
|   |   |-- store/           # Zustand cart store
|   |   `-- lib/             # API, styles, Razorpay loader
|   |-- package.json
|   `-- README.md
|
|-- server/                  # Express backend
|   |-- scripts/             # Seed script
|   |-- src/
|   |   |-- config/          # Environment and database config
|   |   |-- controllers/     # Request handlers
|   |   |-- middlewares/     # Auth, origin guard, error handling
|   |   |-- models/          # Mongoose models
|   |   |-- routes/          # API routes
|   |   |-- services/        # Business logic
|   |   |-- utils/           # Shared utilities
|   |   |-- index.js         # Server entry point
|   |   `-- socket.js        # Socket.IO setup
|   |-- package.json
|   `-- README.md
|
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 20.9+
- npm
- MongoDB running locally or MongoDB Atlas
- Razorpay test key id and secret
- Optional Gemini API key

### Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Server Environment

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_ACCESS_SECRET=replace_with_a_random_secret_at_least_32_characters
JWT_REFRESH_SECRET=replace_with_a_different_random_secret_at_least_32_characters
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
PAYMENT_RESERVATION_TTL_MINUTES=1
```

### Client Environment

Create `client/.env.local` from `client/.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Run Locally

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
cd client
npm run dev
```

Open http://localhost:3000.

## API Summary

Production backend API:

```text
https://cartify-backend-lg8z.onrender.com/api
```

Local backend API:

```text
http://localhost:5000/api
```

The frontend calls `/api/*` and lets Next.js proxy to the configured backend.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` - admin only
- `PUT /api/products/:id` - admin only
- `DELETE /api/products/:id` - admin only

Supported query parameters:

| Parameter | Description |
| --- | --- |
| `search` | Searches product name and description |
| `category` | Exact category match, case-insensitive |
| `minPrice` | Minimum product price |
| `maxPrice` | Maximum product price |
| `stockStatus` | `in_stock`, `out_of_stock`, or omitted |
| `sort` | `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc` |
| `page` | Page number, defaults to `1` |
| `limit` | Products per page, defaults to `8`, max `50` |

### Payments

- `POST /api/payments/razorpay/order` - authenticated users
- `POST /api/payments/razorpay/verify` - authenticated users

### Orders

- `GET /api/orders/my-orders` - authenticated users
- `GET /api/orders/:id` - owner or admin
- `GET /api/orders` - admin only
- `PUT /api/orders/:id/status` - admin only

Direct customer order creation is disabled; checkout must go through Razorpay payment APIs.

### Admin

- `GET /api/admin/dashboard` - admin only

### AI

- `POST /api/ai/shopping-assistant`
- `POST /api/ai/cart-builder`

### Health

- `GET /health`

## WebSocket Events

Cartify uses Socket.IO for order status notifications.

Client to server:

- `order:join` - join updates for one order with `{ orderId }`
- `order:leave` - leave one order room with `{ orderId }`

Server to client:

- `order:status-updated` - emitted after an admin updates order status
- `order:error` - emitted when a socket join is rejected

Socket authentication uses the access cookie during the Socket.IO handshake.

## Deployment

### Vercel Frontend

Use the `client` directory as the Vercel root:

```text
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Required environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

### Render Backend

Use the `server` directory as the Render service root:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Required production environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_ACCESS_SECRET=replace_with_a_random_secret_at_least_32_characters
JWT_REFRESH_SECRET=replace_with_a_different_random_secret_at_least_32_characters
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=30d
NODE_ENV=production
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
PAYMENT_RESERVATION_TTL_MINUTES=1
```

Render usually provides `PORT`; set it manually only if your service requires it.

## CI

GitHub Actions runs:

- Server dependency install with `npm ci`
- Client dependency install with `npm ci`
- Client lint with `npm run lint`
- Client production build with `npm run build`
- Backend Docker image build
- Frontend Docker image build

## Scripts

Client:

```bash
npm run dev
npm run build
npm start
npm run lint
```

Server:

```bash
npm start
npm run seed
```

Last updated: June 30, 2026
