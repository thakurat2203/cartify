# Cartify Server - Express API

The Cartify server is an Express 5 API for authentication, products, orders, admin dashboard metrics, inventory handling, live order status updates, AI-powered recommendations, and budget-safe cart bundles.

## Live Deployment

- Backend API: https://cartify-backend-lg8z.onrender.com
- Health check: https://cartify-backend-lg8z.onrender.com/health
- Frontend client: https://cartify-frontend-rouge.vercel.app

Production CORS is controlled by `CLIENT_URL`:

```env
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

## Current Features

### API

- Auth endpoints for registration, login, and current user lookup
- Product listing, filtering, sorting, pagination, details, and admin CRUD
- Order creation, customer order history, order details, admin order list, and admin status updates
- Admin dashboard metrics for products, orders, revenue, active orders, and stock health
- Dual AI endpoints for product recommendations and deterministic budget-safe bundles, both with Gemini and local fallback parsing
- Health check endpoint at `/health`

### Security And Reliability

- JWT authentication and role-based admin authorization
- Password hashing with bcryptjs
- Backend validation for user, product, and order data
- Backend product price verification and checkout total calculation
- Atomic stock reservation before order creation
- Helmet security headers
- Morgan request logging
- `/api` rate limit of 300 requests per 15 minutes per client
- JSON request body limit of 100kb
- Structured error responses with a backward-compatible top-level `message`

### Realtime

- Socket.IO server attached to the HTTP server
- JWT-protected order rooms
- Customers can join only their own order room
- Admins can join any order room
- Order status updates are broadcast after successful admin status changes

## Tech Stack

- Node.js 20.9+
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens
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
|   |   `-- productController.js
|   |-- middlewares/
|   |   |-- authMiddleware.js
|   |   |-- errorHandler.js
|   |   `-- notFound.js
|   |-- models/
|   |   |-- Order.js
|   |   |-- Product.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- adminRoutes.js
|   |   |-- aiRoutes.js
|   |   |-- authRoutes.js
|   |   |-- healthRoutes.js
|   |   |-- orderRoutes.js
|   |   `-- productRoutes.js
|   |-- services/
|   |   |-- adminService.js
|   |   |-- aiShoppingAssistantService.js
|   |   |-- authService.js
|   |   |-- orderService.js
|   |   `-- productService.js
|   |-- utils/
|   |   |-- createError.js
|   |   |-- errorResponse.js
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
- MongoDB running locally or a MongoDB Atlas connection string
- Optional: Gemini API key for AI-powered shopping assistant responses

### Install

```bash
npm install
```

### Environment

Create `.env` from `.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_ACCESS_SECRET=replace_with_a_random_secret_at_least_32_characters
JWT_REFRESH_SECRET=replace_with_a_different_random_secret_at_least_32_characters
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

`MONGO_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are required. `CLIENT_URL` is also required when `NODE_ENV=production`.

`GEMINI_API_KEY` is optional. If it is not set, both AI modes still work through local fallback parsing.

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
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign access tokens; use at least 32 characters |
| `JWT_REFRESH_SECRET` | Yes | Different secret used to sign refresh tokens; use at least 32 characters |
| `JWT_ACCESS_EXPIRE` | No | Access-token expiry, defaults to `15m` |
| `JWT_REFRESH_EXPIRE` | No | Refresh-token expiry, defaults to `30d` |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port, defaults to `5000` |
| `CLIENT_URL` | Production | Frontend origin allowed by CORS |
| `GEMINI_API_KEY` | No | Enables Gemini-backed assistant parsing |
| `GEMINI_MODEL` | No | Gemini model, defaults to `gemini-2.5-flash` |

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

Register:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

Login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Current user:

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Products

List products:

```http
GET /api/products
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

Example:

```http
GET /api/products?search=mouse&category=accessories&maxPrice=2000&stockStatus=in_stock&sort=price_asc&page=1&limit=8
```

Product details:

```http
GET /api/products/:id
```

Create product, admin only:

```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "price": 1499,
  "description": "Compact wireless mouse",
  "category": "accessories",
  "stock": 25,
  "image": "https://example.com/mouse.jpg"
}
```

Update product, admin only:

```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

Delete product, admin only:

```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

### Orders

Create order:

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingInfo": {
    "fullName": "John Doe",
    "email": "user@example.com",
    "phone": "+91 9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "shippingMethod": "standard"
}
```

`shippingMethod` must be `standard` or `express`. The server recalculates item prices, subtotal, shipping fee, platform fee, item count, and total price before saving the order.

Customer order history:

```http
GET /api/orders/my-orders
Authorization: Bearer <token>
```

Order details:

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

All orders, admin only:

```http
GET /api/orders
Authorization: Bearer <admin_token>
```

Update order status, admin only:

```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

Allowed statuses:

```text
placed, processing, shipped, delivered, cancelled
```

### Admin

Dashboard summary, admin only:

```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

The response includes product counts, order counts, non-cancelled order value, active order count, low-stock count, out-of-stock count, orders grouped by status, recent orders, and inventory previews.

### AI Shopping Assistant And Cart Builder

Use the shopping assistant for a product or category request:

```http
POST /api/ai/shopping-assistant
Content-Type: application/json

{
  "message": "mouse under 2000"
}
```

Response includes the assistant message, filter source (`gemini` or `fallback`), parsed filters, and matching products.

Use the cart builder for a complete setup with a total budget:

```http
POST /api/ai/cart-builder
Content-Type: application/json

{
  "message": "Build me an office setup under 5000"
}
```

Response includes the intent source, requested budget, selected in-stock products with reasons, total price, remaining budget, and categories skipped due to availability or budget. Gemini extracts intent only; server-side deterministic logic selects products and calculates all prices. Both endpoints share a limit of 20 AI requests per 15 minutes per client.

### Health

```http
GET /health
```

## WebSocket Events

Cartify uses Socket.IO for live order status updates.

Client to server:

- `order:join` with `{ orderId, token }`
- `order:leave` with `{ orderId }`

Server to client:

- `order:status-updated` with `{ orderId, status, updatedAt }`
- `order:error` when the socket request is rejected

Order rooms are JWT-protected. Customers can join only their own order room; admins can join any order room.

## Error Responses

API errors keep a top-level `message` and include structured details in `error`.

```json
{
  "message": "Route not found",
  "error": {
    "message": "Route not found",
    "status": 404,
    "code": "ROUTE_NOT_FOUND"
  }
}
```

## Database Models

### User

```javascript
{
  email: String,
  password: String,
  name: String,
  role: "shopper" | "admin",
  createdAt: Date
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
  orderItems: [
    {
      product: ObjectId,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  shippingInfo: Object,
  shippingMethod: "standard" | "express",
  subtotal: Number,
  shippingFee: Number,
  platformFee: Number,
  totalItems: Number,
  totalPrice: Number,
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled",
  createdAt: Date,
  updatedAt: Date
}
```

## Database Seeding

Seed sample products:

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
PORT=5000
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
GEMINI_API_KEY=your_gemini_api_key_if_using_ai
GEMINI_MODEL=gemini-2.5-flash
```

Operational checks:

```bash
npm audit --audit-level=moderate
curl -i https://cartify-backend-lg8z.onrender.com/health
curl -i https://cartify-backend-lg8z.onrender.com/api/nope
```

## Scripts

```bash
npm start      # Start the API server
npm run seed   # Seed sample products
```

Last updated: June 25, 2026
