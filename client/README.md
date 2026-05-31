# 🎨 E-Commerce Frontend - Next.js React Application

The frontend client for the Cartify platform, built with **Next.js 16**, **React 19**, and **Zustand** state management. Provides a complete user interface for browsing products, managing shopping cart, and processing orders.

## **Live Deployment**

- **Frontend:** [https://cartify-frontend-rouge.vercel.app](https://cartify-frontend-rouge.vercel.app)
- **Backend API:** [https://cartify-backend-lg8z.onrender.com](https://cartify-backend-lg8z.onrender.com)
- **Health Check:** [https://cartify-backend-lg8z.onrender.com/health](https://cartify-backend-lg8z.onrender.com/health)

Vercel environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

---

## ✨ **Features**

### **User Features**
- ✅ User registration & login
- ✅ Browse all products
- ✅ View product details
- ✅ Add/remove items from cart
- ✅ Persistent shopping cart (localStorage)
- ✅ Checkout & order placement
- ✅ Order history tracking
- ✅ Responsive design

### **Admin Features**
- ✅ Product management dashboard
- ✅ Create/edit/delete products
- ✅ View all orders
- ✅ Update order status
- ✅ Admin-only route protection

### **Technical Features**
- ✅ Next.js App Router (modern)
- ✅ Zustand for persistent cart state
- ✅ Context API for authentication
- ✅ CSS Modules for styling
- ✅ Form validation
- ✅ Error boundaries & error handling

---
## ✨ **Next.js Features Used**

- **App Router**: Modern file-based routing in `/app` directory
- **Layouts**: Root layout with global styles and header
- **Dynamic Routes**: `[id]` and nested routes for products/orders
- **CSS Modules**: Component-scoped styling
- **Built-in Image Optimization**: Next.js Image component ready
- **Environment Variables**: `.env.local` for API configuration
- **Middleware Ready**: Extensible middleware support

---
## 🛠️ **Tech Stack**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16 | React framework, SSR, routing |
| **React** | 19 | UI library |
| **Zustand** | Latest | State management (cart) |
| **Axios** | Latest | HTTP client |
| **CSS Modules** | Built-in | Component styling |
| **JavaScript** | ES6+ | Language |

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Backend API running locally on port 5000, or the live Render API

### **Installation**

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
Create `.env.local` file for local development:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

For Vercel production, set:
```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

### **Running Locally**

**Development Mode:**
```bash
npm run dev
```
Opens [http://localhost:3000](http://localhost:3000)

Production site: [https://cartify-frontend-rouge.vercel.app](https://cartify-frontend-rouge.vercel.app)

**Production Build:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

---

## 🏗️ **Architecture**

```
┌────────────────────────────────────────────┐
│       Next.js App (Port 3000)               │
├────────────────────────────────────────────┤
│                                             │
│  /app (App Router)                          │
│  ├── layout.js (Root layout)                │
│  ├── page.js (Home/Products)                │
│  ├── /admin (Protected routes)              │
│  │   ├── /products (CRUD)                   │
│  │   └── /orders (Management)               │
│  ├── /cart (Shopping cart)                  │
│  ├── /checkout (Order creation)             │
│  ├── /orders (User order history)           │
│  ├── /login (Auth)                          │
│  └── /register (Auth)                       │
│                                             │
│  State Management                           │
│  ├── Context API (auth-context.js)          │
│  │   └── User token & role info             │
│  └── Zustand (cart-store.js)                │
│      └── Persistent cart state              │
│                                             │
│  Components (Reusable UI)                   │
│  ├── site-header.js (Navigation)            │
│  └── cart-hydrator.js (SSR hydration)       │
│                                             │
│  Utils & Validation                         │
│  └── validation.js (Form rules)             │
│                                             │
└────────────────────────────────────────────┘
         │
         │ Axios HTTP Requests
         ▼
┌────────────────────────────────────────────┐
│  Express API Server (Render / Port 5000)   │
│  (See Server README for details)            │
└────────────────────────────────────────────┘
```

---

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   ├── page.js            # Home (products listing)
│   ├── not-found.js       # 404 page
│   ├── admin/             # Admin pages (protected)
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout
│   ├── login/             # Login
│   ├── orders/            # User orders
│   ├── products/          # Product details
│   └── register/          # Registration
│
├── components/            # Reusable components
│   ├── cart-hydrator.js
│   └── site-header.js
│
├── context/               # React Context
│   └── auth-context.js
│
├── store/                 # Zustand stores
│   └── cart-store.js
│
└── utils/                 # Utilities
    └── validation.js
```

---

## 🔐 **State Management**

### **Cart State (Zustand)**
- Persistent cart with localStorage
- Add/remove/update items
- Cart totals calculation
- Hydration for SSR compatibility

### **Auth State (Context API)**
- User login/logout
- Token management
- Role-based access

---

## 📝 **Form Validation**

Validation rules in `utils/validation.js`:
- **Email:** Valid format required
- **Password:** Min 6 characters
- **Name:** 2-50 characters
- **Product Name:** Required, 1-100 characters
- **Price:** Positive number

---

## 🧪 **Development**

### **Available Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## **Deployment**

This app is deployed on Vercel from the `client` directory.

Recommended Vercel settings:

```text
Root Directory: client
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

Required environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

After changing this variable in Vercel, redeploy the frontend.

---

## 🎯 **Future Improvements**

- [ ] Migrate to Tailwind CSS
- [ ] Add product search & filtering
- [ ] Implement pagination
- [ ] Add product reviews
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)
- [ ] Comprehensive E2E tests

---

**Last Updated:** May 31, 2026
