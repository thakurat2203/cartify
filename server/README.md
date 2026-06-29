# Cartify Server - Express API

The Cartify server is an Express 5 API for authentication, products, Razorpay test-mode payments, orders, admin dashboards, inventory handling, live order updates, and AI-powered shopping features.

## Live Deployment

- Backend API: https://cartify-backend-lg8z.onrender.com
- Health check: https://cartify-backend-lg8z.onrender.com/health
- Frontend client: https://cartify-frontend-rouge.vercel.app

Production CORS is controlled by:

```env
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

## Features

### API

- Cookie-based auth endpoints for registration, login, refresh, logout, and current user lookup.
- Product listing, filtering, sorting, pagination, details, and admin CRUD.
- Razorpay test-mode order creation and checkout signature verification.
- Customer order history and order details.
- Admin order list, order details, and paid-order fulfillment updates.
- Admin dashboard metrics for products, orders, revenue, active orders, and stock health.
- AI endpoints for product recommendations and budget-safe bundles.
- Health check endpoint at `/health`.

### Security And Reliability

- HTTP-only access and refresh cookies.
- Refresh sessions stored as hashes in MongoDB.
- Refresh token rotation and logout revocation.
- Role-based admin authorization.
- Password hashing with bcryptjs.
- Origin guard for state-changing `/api` requests.
- Backend validation for user, product, checkout, and order data.
- Server-side product price verification and checkout total calculation.
- Atomic stock reservation before Razorpay checkout.
- Expired pending payment cleanup and stock release.
- Helmet security headers, Morgan request logging, rate limiting, and 100kb JSON body limit.
- Structured API error responses.

### Realtime

- Socket.IO server attached to the HTTP server.
- Socket handshake authenticates from the access cookie.
- Customers can join only their own order room.
- Admins can join any order room.
- Order status updates are broadcast after successful admin updates.

## Tech Stack

- Node.js 20.9+
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens
- Razorpay SDK
- bcryptjs
- cors
- dotenv
- helmet
- morgan
- express-rate-limit

## Project Structure

```text
server/
|-- scripts/
|   `-- seedProducts.js
|-- src/
|   |-- config/
|   |   |-- db.js
|   |   `-- index.js
|   |-- controllers/
|   |   |-- adminController.js
|   |   |-- aiController.js
|   |   |-- authController.js
|   |   |-- healthController.js
|   |   |-- orderController.js
|   |   |-- paymentController.js
|   |   `-- productController.js
|   |-- middlewares/
|   |   |-- authMiddleware.js
|   |   |-- cookieParser.js
|   |   |-- errorHandler.js
|   |   |-- originGuard.js
|   |   `-- notFound.js
|   |-- models/
|   |   |-- Order.js
|   |   |-- Product.js
|   |   |-- Session.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- adminRoutes.js
|   |   |-- aiRoutes.js
|   |   |-- authRoutes.js
|   |   |-- healthRoutes.js
|   |   |-- orderRoutes.js
|   |   |-- paymentRoutes.js
|   |   `-- productRoutes.js
|   |-- services/
|   |   |-- adminService.js
|   |   |-- aiCartBuilderService.js
|   |   |-- aiShoppingAssistantService.js
|   |   |-- authService.js
|   |   |-- orderService.js
|   |   |-- paymentService.js
|   |   |-- productService.js
|   |   `-- sessionService.js
|   |-- utils/
|   |   |-- authCookies.js
|   |   |-- authTokens.js
|   |   |-- createError.js
|   |   |-- errorResponse.js
|   |   |-- paymentSignatures.js
|   |   |-- publicUser.js
|   |   `-- validation.js
|   |-- index.js
|   `-- socket.js
|-- package.json
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 20.9+
- npm
- MongoDB running locally or MongoDB Atlas
- Razorpay test key id and secret
- Optional Gemini API key

### Install

```bash
npm install
```

### Environment

Create `.env` from `.env.example`:

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

Required locally:

- `MONGO_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Required in production:

- `CLIENT_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

`GEMINI_API_KEY` is optional. Without it, AI endpoints use local fallback parsing.

### Run

```bash
npm start
```

Health check:

```bash
curl http://localhost:5000/health
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Access-token secret, at least 32 characters |
| `JWT_REFRESH_SECRET` | Yes | Different refresh-token secret, at least 32 characters |
| `JWT_ACCESS_EXPIRE` | No | Access-token expiry, defaults to `15m` |
| `JWT_REFRESH_EXPIRE` | No | Refresh-token expiry, defaults to `30d` |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port, defaults to `5000` |
| `CLIENT_URL` | Production | Frontend origin allowed by CORS and origin guard |
| `GEMINI_API_KEY` | No | Enables Gemini-backed AI parsing |
| `GEMINI_MODEL` | No | Gemini model, defaults to `gemini-2.5-flash` |
| `RAZORPAY_KEY_ID` | Production payment | Razorpay test key id |
| `RAZORPAY_KEY_SECRET` | Production payment | Razorpay test key secret |
| `PAYMENT_RESERVATION_TTL_MINUTES` | No | Pending payment reservation window, currently `1` for demo |

## API Base URLs

Production:

```text
https://cartify-backend-lg8z.onrender.com/api
```

Local:

```text
http://localhost:5000/api
```

## API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

Auth uses HTTP-only cookies. Client requests should include credentials.

### Products

```http
GET    /api/products
GET    /api/products/:id
POST   /api/products       # admin only
PUT    /api/products/:id   # admin only
DELETE /api/products/:id   # admin only
```

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

Create a Razorpay checkout order:

```http
POST /api/payments/razorpay/order
Content-Type: application/json
```

Verify Razorpay checkout success:

```http
POST /api/payments/razorpay/verify
Content-Type: application/json
```

Payment notes:

- The backend calculates totals from live product data.
- The backend reserves stock before creating the Razorpay order.
- Payment is marked paid only after signature verification.
- Webhooks and refunds are not part of this demo scope.

### Orders

```http
GET /api/orders/my-orders       # authenticated users
GET /api/orders/:id             # owner or admin
GET /api/orders                 # admin only
PUT /api/orders/:id/status      # admin only
```

Direct customer order creation is disabled. Checkout goes through the payment APIs.

Allowed fulfillment statuses:

```text
placed, processing, shipped, delivered, cancelled
```

Only paid orders can move to `processing`, `shipped`, or `delivered`.

### Admin

```http
GET /api/admin/dashboard
```

### AI

Simple recommendation:

```http
POST /api/ai/shopping-assistant
Content-Type: application/json
```

Budget bundle:

```http
POST /api/ai/cart-builder
Content-Type: application/json
```

Both endpoints use Gemini when configured and local fallback parsing otherwise.

### Health

```http
GET /health
```

## WebSocket Events

Cartify uses Socket.IO for live order status updates.

Client to server:

- `order:join` with `{ orderId }`
- `order:leave` with `{ orderId }`

Server to client:

- `order:status-updated` with `{ orderId, status, updatedAt }`
- `order:error` when the socket request is rejected

Order rooms authenticate through the Socket.IO handshake cookie.

## Database Models

### User

```javascript
{
  email: String,
  password: String,
  name: String,
  phone: String,
  role: "shopper" | "admin",
  addresses: Array,
  createdAt: Date
}
```

### Session

```javascript
{
  user: ObjectId,
  tokenHash: String,
  familyId: String,
  revokedAt: Date,
  expiresAt: Date
}
```

### Product

```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  image: String,
  createdAt: Date
}
```

### Order

```javascript
{
  user: ObjectId,
  orderItems: Array,
  shippingInfo: Object,
  shippingMethod: "standard" | "express",
  subtotal: Number,
  shippingFee: Number,
  platformFee: Number,
  totalItems: Number,
  totalPrice: Number,
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled",
  paymentStatus: "pending" | "paid" | "failed",
  stockReservationStatus: "reserved" | "confirmed" | "released",
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paidAt: Date,
  failedAt: Date,
  stockReservationExpiresAt: Date
}
```

## Database Seeding

```bash
npm run seed
```

## Render Deployment

Use the `server` directory for the Render service.

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Production environment variables:

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

Operational checks:

```bash
curl -i https://cartify-backend-lg8z.onrender.com/health
curl -i "https://cartify-backend-lg8z.onrender.com/api/products?limit=1"
```

## Scripts

```bash
npm start      # Start the API server
npm run seed   # Seed sample products
```

Last updated: June 30, 2026
