# 🛍️ Cartify - Full Stack E-Commerce Platform

A complete, production-ready e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). Features include user authentication, product management, shopping cart, and order processing with role-based admin panel.

**Live Demo:** [https://cartify-frontend-rouge.vercel.app](https://cartify-frontend-rouge.vercel.app)

**Live API:** [https://cartify-backend-lg8z.onrender.com](https://cartify-backend-lg8z.onrender.com)

---

## ⭐ **Highlights**

- **Full-Stack MERN**: Modern JavaScript stack from frontend to backend
- **Secure Authentication**: JWT-based auth with password hashing
- **Role-Based Access**: Admin panel with restricted product & order management
- **Persistent Cart**: Client-side cart with localStorage integration
- **Production-Ready**: Input validation, error handling, and security best practices
- **Live Deployment**: Frontend deployed on Vercel and backend deployed on Render

---

## **Live Deployment**

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [https://cartify-frontend-rouge.vercel.app](https://cartify-frontend-rouge.vercel.app) |
| Backend API | Render | [https://cartify-backend-lg8z.onrender.com](https://cartify-backend-lg8z.onrender.com) |
| Health Check | Render | [https://cartify-backend-lg8z.onrender.com/health](https://cartify-backend-lg8z.onrender.com/health) |

The deployed frontend uses the Render API through:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

The deployed backend allows the Vercel frontend through:

```env
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

---

## 📸 **Features**

### 🛒 Customer Features
- ✅ User registration & authentication (JWT)
- ✅ Product browsing & filtering
- ✅ Shopping cart with persistent storage
- ✅ Checkout & order placement
- ✅ Order tracking & history
- ✅ Session persistence with localStorage

### 👨‍💼 Admin Features
- ✅ Product management (create, update, delete)
- ✅ Order management & status tracking
- ✅ Inventory management
- ✅ Role-based access control

### 🔒 Security Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Backend price verification (prevents fraud)
- ✅ Stock validation before orders
- ✅ Role-based authorization middleware

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client (Next.js 16)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages (App Router) + Components + State Management       │   │
│  │ - Auth Context (JWT token management)                    │   │
│  │ - Zustand Store (persistent cart)                        │   │
│  │ - CSS Modules (scoped styling)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ▲                                       │
│                           │ Axios HTTP Client                     │
│                           ▼                                       │
├─────────────────────────────────────────────────────────────────┤
│            API Gateway (Express.js on Node.js)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes → Controllers → Services → Models → MongoDB       │   │
│  │ - Auth middleware (JWT verification)                     │   │
│  │ - Error handling middleware                              │   │
│  │ - Input validation                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ▲                                       │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ MongoDB (User, Product, Order collections)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework:** Next.js 16 (React 19, App Router)
- **State Management:** Zustand (cart), Context API (auth)
- **Styling:** CSS Modules
- **HTTP Client:** Axios
- **Build Tool:** Next.js built-in

### **Backend**
- **Runtime:** Node.js
- **Server:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password:** bcryptjs

### **Deployment**
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** MongoDB Atlas or compatible MongoDB connection
- **Future DevOps:** Docker, GitHub Actions CI/CD, AWS deployment guide

---

## 📁 **Project Structure**

```
e-commerce/
├── client/                    # Next.js frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   ├── cart/        # Shopping cart page
│   │   │   ├── checkout/    # Checkout page
│   │   │   ├── login/       # Login page
│   │   │   ├── orders/      # Order history page
│   │   │   ├── products/    # Product pages
│   │   │   └── register/    # Registration page
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context (Auth)
│   │   ├── store/           # Zustand stores (Cart)
│   │   └── utils/           # Utilities
│   ├── package.json
│   ├── next.config.mjs
│   └── README.md
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── config/          # Configuration
│   │   ├── models/          # Database schemas
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Utility scripts
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── README.md
│
└── README.md               # This file
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/e-commerce.git
cd e-commerce
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Setup environment variables**

Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=1d
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### **Running Locally**

**Terminal 1 - Backend (port 5000):**
```bash
cd server
npm start
```

**Terminal 2 - Frontend (port 3000):**
```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 **API Documentation**

### **Base URL**
Production:
```
https://cartify-backend-lg8z.onrender.com/api
```

Local:
```
http://localhost:5000/api
```

### **Authentication Endpoints**

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### **Product Endpoints**

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin only)
```http
POST /api/products
Authorization: Bearer <token>
```

#### Update Product (Admin only)
```http
PUT /api/products/:id
Authorization: Bearer <token>
```

#### Delete Product (Admin only)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

---

### **Order Endpoints**

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
```

#### Get User's Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Order Status (Admin only)
```http
PUT /api/orders/:id
Authorization: Bearer <token>
```

---

## 🗄️ **Database Models**

### **User Schema**
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String ("shopper" | "admin"),
  createdAt: Date
}
```

### **Product Schema**
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

### **Order Schema**
```javascript
{
  user: ObjectId (ref: User),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Number,
      price: Number (snapshot at purchase)
    }
  ],
  totalPrice: Number,
  status: String ("pending" | "processing" | "shipped" | "delivered"),
  shippingAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 **Security Features**

- ✅ JWT authentication with 24-hour expiration
- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Backend price recalculation on orders
- ✅ Stock validation before order creation
- ✅ Input validation on both frontend & backend
- ✅ Role-based authorization middleware

---

## 📝 **Environment Variables**

### **Server (.env)**
Production on Render:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1d
NODE_ENV=production
PORT=5000
API_BASE_URL=https://cartify-backend-lg8z.onrender.com
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

Local development:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=1d
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### **Client (.env.local)**
Production on Vercel:
```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

Local development:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---

## 📚 **Documentation**

- [Frontend README](client/README.md) - Next.js client setup & features
- [Backend README](server/README.md) - Express API documentation

---

## 📄 **License**

This project is open source and available under the MIT License.

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🎯 **Next Steps / Roadmap**

- [ ] Docker deployment setup
- [ ] GitHub Actions CI/CD
- [ ] AWS deployment guide
- [ ] Search & filtering functionality
- [ ] Product reviews & ratings
- [ ] Wishlist feature
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Comprehensive test suite
- [ ] API documentation (Swagger)

---

**Last Updated:** May 31, 2026
