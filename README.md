# Cartify - Full Stack E-Commerce Platform

[![CI](https://github.com/thakurat2203/cartify/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thakurat2203/cartify/actions/workflows/ci.yml)

Cartify is a MERN-style e-commerce application with a Next.js frontend, an Express API, MongoDB persistence, JWT authentication, role-based admin tools, live order status updates, and an AI shopping assistant.

## Live Deployment

| Service | Platform | URL |
| --- | --- | --- |
| Frontend | Vercel | https://cartify-frontend-rouge.vercel.app |
| Backend API | Render | https://cartify-backend-lg8z.onrender.com |
| Health Check | Render | https://cartify-backend-lg8z.onrender.com/health |

Production client API value:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

Production server CORS value:

```env
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

## Current Features

### Customer

- User registration, login, and session persistence
- Product catalog with search, category, price filters, sorting, and pagination
- AI shopping assistant for product recommendations by name, category, or budget
- Product detail pages with image fallback UI
- Persistent shopping cart with stock-aware quantity controls
- Checkout with shipping details, shipping method, and fee summary
- Order history and individual order tracking
- Live order status updates through Socket.IO

### Admin

- Role-protected admin dashboard
- Store summary metrics for products, orders, revenue, active orders, and inventory health
- Product create, update, delete, stock, category, and image URL management
- Order list, status filtering, order details, and status updates
- Low-stock and out-of-stock product visibility

### Backend

- JWT authentication and admin authorization middleware
- Password hashing with bcryptjs
- Backend validation for auth, products, checkout, and orders
- Backend order total calculation and price verification
- Atomic stock reservation before order creation
- Socket.IO order rooms protected by JWT
- Helmet security headers, Morgan request logging, API rate limiting, and JSON body size limits
- Structured API error responses

## Tech Stack

### Frontend

- Next.js 16
- React 19
- Zustand
- Axios
- Socket.IO Client
- CSS Modules

### Backend

- Node.js 20.9+
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens
- bcryptjs
- Helmet, Morgan, express-rate-limit
- Gemini API integration for the shopping assistant, with a local fallback parser

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas or any compatible MongoDB connection string

## DevOps Proof

Cartify includes a practical DevOps setup for local development, CI checks, containerized execution, deployment, monitoring, and production readiness.

### Docker

Backend image:

```bash
docker build -t cartify-server:dev ./server
docker run --name cartify-server-dev --env-file ./server/.env -p 5000:5000 cartify-server:dev
```

Frontend image:

```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:5000 -t cartify-client:dev ./client
docker run --name cartify-client-dev -p 3000:3000 cartify-client:dev
```

### Docker Compose

Run the full local stack with frontend, backend, MongoDB, and seed data:

```bash
docker compose up --build -d
```

Check services:

```bash
docker compose ps
docker compose logs backend
docker compose logs client
docker compose logs seed
```

Stop services while keeping MongoDB volume data:

```bash
docker compose down
```

Remove services and MongoDB volume data:

```bash
docker compose down -v
```

### CI/CD

GitHub Actions CI is defined in `.github/workflows/ci.yml` and runs on pushes to `main` and pull requests.

CI checks:

- Server dependency install with `npm ci`
- Client dependency install with `npm ci`
- Client lint with `npm run lint`
- Client production build with `npm run build`
- Backend Docker image build
- Frontend Docker image build

CD is handled by Vercel and Render:

- Vercel deploys the `client` frontend.
- Render deploys the `server` backend.
- Deployments should be promoted only after CI is green.

### Production Operations

Important production checks:

```bash
curl -i https://cartify-backend-lg8z.onrender.com/health
curl -i "https://cartify-backend-lg8z.onrender.com/api/products?limit=1"
```

Operational docs:

- [Deployment and CD guide](docs/deployment-cd-guide.md)
- [Monitoring and debugging checklist](docs/monitoring-debugging-checklist.md)
- [Security and production readiness checklist](docs/production-readiness-checklist.md)

## Project Structure

```text
e-commerce/
|-- client/                  # Next.js frontend
|   |-- src/
|   |   |-- app/             # App Router pages
|   |   |-- components/      # Shared UI components
|   |   |-- context/         # Auth and cart contexts
|   |   |-- store/           # Zustand cart store
|   |   `-- utils/           # Frontend validation helpers
|   |-- package.json
|   `-- README.md
|
|-- server/                  # Express backend
|   |-- src/
|   |   |-- config/          # Environment and database config
|   |   |-- controllers/     # Request handlers
|   |   |-- middlewares/     # Auth, not found, and error middleware
|   |   |-- models/          # Mongoose models
|   |   |-- routes/          # API routes
|   |   |-- services/        # Business logic
|   |   |-- utils/           # Shared backend utilities
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
- MongoDB running locally or a MongoDB Atlas connection string
- Optional: Gemini API key for AI-powered shopping assistant responses

### Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Environment Variables

Create `server/.env` from `server/.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=replace_with_a_secret_at_least_32_characters
JWT_EXPIRE=1d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Create `client/.env.local` from `client/.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Run Locally

Start the backend:

```bash
cd server
npm start
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open http://localhost:3000.

## API Summary

Production base URL:

```text
https://cartify-backend-lg8z.onrender.com/api
```

Local base URL:

```text
http://localhost:5000/api
```

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` - authenticated users

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` - admin only
- `PUT /api/products/:id` - admin only
- `DELETE /api/products/:id` - admin only

Supported product query parameters:

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

### Orders

- `POST /api/orders` - authenticated users
- `GET /api/orders/my-orders` - authenticated users
- `GET /api/orders/:id` - owner or admin
- `GET /api/orders` - admin only
- `PUT /api/orders/:id/status` - admin only

### Admin

- `GET /api/admin/dashboard` - admin only

### AI Shopping Assistant

- `POST /api/ai/shopping-assistant`

Request:

```json
{
  "message": "mouse under 2000"
}
```

The assistant uses Gemini when `GEMINI_API_KEY` is set. If it is not set or the Gemini request fails, the backend uses the local fallback parser and still returns product recommendations from the catalog.

### Health

- `GET /health`

## WebSocket Events

Cartify uses Socket.IO for order status notifications.

Client to server:

- `order:join` - join updates for one order with `{ orderId, token }`
- `order:leave` - leave one order room with `{ orderId }`

Server to client:

- `order:status-updated` - emitted after an admin updates an order status
- `order:error` - emitted when a socket join is rejected

## Deployment Notes

Detailed deployment and CD notes are available in [docs/deployment-cd-guide.md](docs/deployment-cd-guide.md).
Production monitoring and debugging steps are available in [docs/monitoring-debugging-checklist.md](docs/monitoring-debugging-checklist.md).
Security and production readiness checks are available in [docs/production-readiness-checklist.md](docs/production-readiness-checklist.md).

### Vercel Frontend

Use the `client` directory as the Vercel root.

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

### Render Backend

Use the `server` directory for the Render service.

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Required production environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_secret_at_least_32_characters
JWT_EXPIRE=1d
NODE_ENV=production
PORT=5000
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
GEMINI_API_KEY=your_gemini_api_key_if_using_ai
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` is optional. Without it, the shopping assistant uses fallback filter parsing.

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

Last updated: June 17, 2026
