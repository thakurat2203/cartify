# 🔌 E-Commerce Backend - Express.js API Server

The REST API backend for the Cartify platform, built with **Node.js**, **Express**, and **MongoDB**. Handles authentication, product management, orders, and inventory management.

---

## ✨ **Features**

### **Core Functionality**
- ✅ RESTful API endpoints
- ✅ User authentication with JWT
- ✅ Product CRUD operations
- ✅ Order management & tracking
- ✅ Inventory management
- ✅ Role-based access control (admin/shopper)

### **Security Features**
- ✅ Password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ Backend price verification (prevents fraud)
- ✅ Stock validation before orders
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
│  └── healthController.js                            │
│         │                                            │
│         ▼                                            │
│  Services (Business Logic)                           │
│  ├── authService.js (register, login, verify)       │
│  ├── productService.js (CRUD operations)            │
│  └── orderService.js (order processing)             │
│         │                                            │
│         ▼                                            │
│  Mongoose Models (Data Validation)                   │
│  ├── User.js (email, password, role)                │
│  ├── Product.js (name, price, stock)                │
│  └── Order.js (items, status, address)              │
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
│  6. Return: JWT token + user data                       │
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
│  5. If valid: Generate JWT token (valid 24 hours)       │
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

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | Latest | Web server framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | Latest | MongoDB ODM |
| **bcryptjs** | Latest | Password hashing |
| **jsonwebtoken** | Latest | JWT authentication |

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
Create `.env` file (copy from `.env.example`):
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
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

3. **Start MongoDB**
```bash
mongod
```

### **Running the Server**

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Health Check:**
```bash
curl http://localhost:5000/health
```

---

## 📚 **API Endpoints**

### **Base URL**
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
  "stock": 50
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
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345"
}
```

### **Get User's Orders**
```http
GET /api/orders
Authorization: Bearer <token>
```

### **Get Order by ID**
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### **Update Order Status** (Admin only)
```http
PUT /api/orders/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

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
  image: String,
  createdAt: Date
}
```

### **Order Model**
```javascript
{
  user: ObjectId (ref: User),
  items: [...],
  totalPrice: Number,
  status: String ("pending" | "processing" | "shipped" | "delivered"),
  shippingAddress: String,
  createdAt: Date
}
```

---

## 🔐 **Authentication & Authorization**

### **JWT Token**
- Issued on login/register
- Valid for 24 hours
- Sent in `Authorization: Bearer <token>` header

### **Protected Routes**
```
Requires authenticated user:
GET /api/auth/me
GET /api/orders
POST /api/orders

Requires admin role:
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
PUT /api/orders/:id
```

---

## ✅ **Security Features**

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ Backend price verification (prevents fraud)
- ✅ Stock validation before orders
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
npm run dev            # Start with nodemon (auto-reload)
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
- [ ] Comprehensive test suite
- [ ] API documentation (Swagger)

---

**Last Updated:** May 30, 2026
