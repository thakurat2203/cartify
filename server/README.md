# 🔌 E-Commerce Backend - Express.js API Server

The REST API backend for the Cartify platform, built with **Node.js**, **Express**, and **MongoDB**. Handles authentication, product management, orders, and inventory management.

## **Live Deployment**

- **Backend API:** [https://cartify-backend-lg8z.onrender.com](https://cartify-backend-lg8z.onrender.com)
- **Health Check:** [https://cartify-backend-lg8z.onrender.com/health](https://cartify-backend-lg8z.onrender.com/health)
- **Frontend Client:** [https://cartify-frontend-rouge.vercel.app](https://cartify-frontend-rouge.vercel.app)

Render environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=1d
NODE_ENV=production
PORT=5000
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

The `CLIENT_URL` value is required for CORS so the Vercel frontend can call the Render backend.

---

## ✨ **Features**

### **Core Functionality**

- ✅ RESTful API endpoints
- ✅ User authentication with JWT
- ✅ Product CRUD operations
- ✅ Order management & tracking
- ✅ Structured checkout with shipping and platform fee calculation
- ✅ Admin dashboard summary API
- ✅ Inventory management
- ✅ Low-stock and out-of-stock inventory visibility
- ✅ Role-based access control (admin/shopper)

### **Security Features**

- ✅ Password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ Backend price verification (prevents fraud)
- ✅ Atomic stock reservation before orders
- ✅ Input validation on all endpoints
- ✅ Error handling middleware

### **Technical Features**

- ✅ Express.js middleware architecture
- ✅ Service layer for business logic
- ✅ MongoDB with Mongoose ODM
- ✅ Custom error handling
- ✅ Consistent error responses
- ✅ Database seeding scripts

---

## 🏗️ **Backend Architecture**

```
┌─────────────────────────────────────────────────────┐
│            Express.js Server (Port 5000)             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Routes Layer (/api/auth, /api/products, etc.)      │
│         │                                            │
│         ▼                                            │
│  Middleware Stack                                    │
│  ├── Auth Middleware (JWT verification)             │
│  ├── Error Handler                                  │
│  └── Input Validation                               │
│         │                                            │
│         ▼                                            │
│  Controllers (Request Handlers)                      │
│  ├── authController.js                              │
│  ├── productController.js                           │
│  ├── orderController.js                             │
│  ├── adminController.js                             │
│  └── healthController.js                            │
│         │                                            │
│         ▼                                            │
│  Services (Business Logic)                           │
│  ├── authService.js (register, login, verify)       │
│  ├── productService.js (CRUD operations)            │
│  ├── orderService.js (order processing)             │
│  └── adminService.js (dashboard metrics)            │
│         │                                            │
│         ▼                                            │
│  Mongoose Models (Data Validation)                   │
│  ├── User.js (email, password, role)                │
│  ├── Product.js (name, price, stock)                │
│  └── Order.js (items, shipping, totals, status)     │
│         │                                            │
│         ▼                                            │
│  MongoDB Collections                                 │
│  ├── users                                          │
│  ├── products                                       │
│  └── orders                                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 **Auth Flow**

```
┌──────────────────────────────────────────────────────────┐
│                   REGISTRATION FLOW                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. User submits: { email, password, name }             │
│         │                                                │
│         ▼                                                │
│  2. Validation: Email format, password length (6+ chars)│
│         │                                                │
│         ▼                                                │
│  3. Check: Email doesn't exist in DB                    │
│         │                                                │
│         ▼                                                │
│  4. Hash password with bcryptjs (10 salt rounds)        │
│         │                                                │
│         ▼                                                │
│  5. Create user in MongoDB with role='shopper'          │
│         │                                                │
│         ▼                                                │
│  6. Return: user data                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. User submits: { email, password }                   │
│         │                                                │
│         ▼                                                │
│  2. Find user by email in MongoDB                       │
│         │                                                │
│         ▼                                                │
│  3. Compare password with hashed password (bcryptjs)    │
│         │                                                │
│         ▼                                                │
│  4. If invalid: Return 401 error                        │
│  5. If valid: Generate JWT token using JWT_EXPIRE       │
│         │                                                │
│         ▼                                                │
│  6. Return: JWT token + user data (email, role, name)   │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              PROTECTED REQUESTS FLOW                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Client sends: Authorization: Bearer <JWT_TOKEN>     │
│         │                                                │
│         ▼                                                │
│  2. Auth Middleware: Verify JWT signature & expiry      │
│         │                                                │
│         ▼                                                │
│  3. If invalid/expired: Return 401 error                │
│  4. If valid: Extract user ID & role from token        │
│         │                                                │
│         ▼                                                │
│  5. Proceed to controller with user info                │
│  6. Check role permissions (admin only endpoints)       │
│         │                                                │
│         ▼                                                │
│  7. Execute business logic (controller → service)       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ **Tech Stack**

| Technology       | Version | Purpose              |
| ---------------- | ------- | -------------------- |
| **Node.js**      | 18+     | JavaScript runtime   |
| **Express**      | Latest  | Web server framework |
| **MongoDB**      | Latest  | NoSQL database       |
| **Mongoose**     | Latest  | MongoDB ODM          |
| **bcryptjs**     | Latest  | Password hashing     |
| **jsonwebtoken** | Latest  | JWT authentication   |

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- MongoDB 4.4+

### **Installation**

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**
   Create `.env` file. From the `server` folder:

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=1d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

For Render production, use:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=1d
NODE_ENV=production
PORT=5000
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

3. **Start MongoDB**

```bash
mongod
```

### **Running the Server**

**Start the server:**

```bash
npm start
```

**Health Check:**

```bash
curl http://localhost:5000/health
```

Live health check:

```bash
curl https://cartify-backend-lg8z.onrender.com/health
```

---

## 📚 **API Endpoints**

### **Base URL**

Production:

```
https://cartify-backend-lg8z.onrender.com/api
```

Local:

```
http://localhost:5000/api
```

---

## 🔐 **Authentication Endpoints** (`/api/auth`)

### **Register User**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### **Login User**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### **Get Current User**

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 📦 **Product Endpoints** (`/api/products`)

### **Get All Products**

```http
GET /api/products
```

Supports optional query parameters:

```http
GET /api/products?search=phone&category=accessories&minPrice=500&maxPrice=2000&sort=price_asc&page=1&limit=8
```

Query parameters:

| Name       | Description                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| `search`   | Searches product name and description                                         |
| `category` | Filters by exact category, case-insensitive                                   |
| `minPrice` | Minimum product price                                                         |
| `maxPrice` | Maximum product price                                                         |
| `sort`     | One of `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc` |
| `page`     | Page number, defaults to `1`                                                  |
| `limit`    | Products per page, defaults to `8`, max `50`                                  |

Response:

```json
{
  "products": [],
  "page": 1,
  "limit": 8,
  "totalPages": 3,
  "totalProducts": 19,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### **Get Product by ID**

```http
GET /api/products/:id
```

### **Create Product** (Admin only)

```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Product",
  "price": 49.99,
  "description": "Product description",
  "category": "accessories",
  "stock": 50,
  "image": "https://example.com/product-image.jpg"
}
```

### **Update Product** (Admin only)

```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

### **Delete Product** (Admin only)

```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

---

## 🛒 **Order Endpoints** (`/api/orders`)

### **Create Order**

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

`shippingMethod` must be `standard` or `express`. The server recalculates product prices, subtotal, shipping fee, platform fee, and total price before saving the order.

### **Get User's Orders**

```http
GET /api/orders/my-orders
Authorization: Bearer <token>
```

### **Get All Orders** (Admin only)

```http
GET /api/orders
Authorization: Bearer <admin_token>
```

### **Get Order by ID**

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### **Update Order Status** (Admin only)

```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

---

After a successful status update, the backend broadcasts a Socket.IO
`order:status-updated` event to connected clients watching that order.

---

## **WebSocket Events**

Cartify uses Socket.IO for live order status updates. REST APIs still save and validate data; WebSockets only notify connected clients after an order status changes.

Client to server:

- `order:join` - join live updates for one order. Payload: `{ orderId, token }`
- `order:leave` - leave one order room. Payload: `{ orderId }`

Server to client:

- `order:status-updated` - emitted after admin updates an order status. Payload: `{ orderId, status, updatedAt }`
- `order:error` - emitted when a socket join fails or is not allowed.

Order rooms are JWT-protected. Customers can join only their own order room; admins can join any order room.

---

## 📊 **Admin Dashboard Endpoints** (`/api/admin`)

### **Get Dashboard Summary** (Admin only)

```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

Returns store-level admin metrics:

```json
{
  "dashboard": {
    "totalProducts": 20,
    "totalOrders": 12,
    "totalRevenue": 5420,
    "activeOrders": 4,
    "lowStockCount": 3,
    "outOfStockCount": 1,
    "lowStockThreshold": 10,
    "ordersByStatus": {
      "placed": 2,
      "processing": 1,
      "shipped": 1,
      "delivered": 7,
      "cancelled": 1
    },
    "recentOrders": [],
    "lowStockProducts": [],
    "outOfStockProducts": []
  }
}
```

`totalRevenue` represents non-cancelled order value because payment processing has not been added yet.

---

## 🗄️ **Database Models**

### **User Model**

```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String ("shopper" | "admin"),
  createdAt: Date
}
```

### **Product Model**

```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  image: String (URL),
  createdAt: Date
}
```

### **Order Model**

```javascript
{
  user: ObjectId (ref: User),
  orderItems: [
    {
      product: ObjectId (ref: Product),
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  shippingInfo: {
    fullName: String,
    email: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  shippingMethod: String ("standard" | "express"),
  subtotal: Number,
  shippingFee: Number,
  platformFee: Number,
  totalItems: Number,
  totalPrice: Number,
  status: String ("placed" | "processing" | "shipped" | "delivered" | "cancelled"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 **Authentication & Authorization**

### **JWT Token**

- Issued on login
- Valid for the configured `JWT_EXPIRE` value (`1d` by default)
- Sent in `Authorization: Bearer <token>` header

### **Protected Routes**

```
Requires authenticated user:
GET /api/auth/me
GET /api/orders/my-orders
POST /api/orders

Requires admin role:
GET /api/admin/dashboard
GET /api/orders
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
PUT /api/orders/:id/status
```

---

## ✅ **Security Features**

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ Backend price verification (prevents fraud)
- ✅ Atomic stock reservation before orders
- ✅ JWT authentication with expiration
- ✅ Input validation on all endpoints
- ✅ Role-based authorization middleware

---

## 📦 **Database Seeding**

### **Seed Sample Products**

```bash
npm run seed
```

---

## 📝 **Error Handling**

### **Error Response Format**

```json
{
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "status": 404
  }
}
```

---

## 📋 **Available Scripts**

```bash
npm start              # Start production server
npm run seed           # Seed database with sample products
```

---

## 🎯 **Future Improvements**

- [ ] Request logging (Morgan)
- [ ] Error tracking (Sentry)
- [ ] Rate limiting
- [ ] Pagination for list endpoints
- [ ] Search & filtering
- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] API documentation (Swagger)

---

**Last Updated:** June 7, 2026
