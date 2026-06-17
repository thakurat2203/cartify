# Cartify Deployment And CD Guide

This guide explains how Cartify is deployed and how code changes move from GitHub to production.

## What CD Means In This Project

CD means Continuous Delivery or Continuous Deployment.

In Cartify, CI checks the code with GitHub Actions. CD is handled by the hosting platforms:

- Vercel deploys the Next.js frontend from the `client` directory.
- Render deploys the Express backend from the `server` directory.

The safe deployment flow is:

```text
developer pushes code
GitHub Actions CI runs
CI passes
Vercel/Render deploy the changed service
production health and smoke checks pass
```

## Production URLs

| Service | Platform | URL |
| --- | --- | --- |
| Frontend | Vercel | https://cartify-frontend-rouge.vercel.app |
| Backend API | Render | https://cartify-backend-lg8z.onrender.com |
| Backend Health | Render | https://cartify-backend-lg8z.onrender.com/health |

## Frontend Deployment: Vercel

The frontend is a Next.js app.

Use these Vercel project settings:

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

Important: `NEXT_PUBLIC_API_BASE_URL` is used by browser-side JavaScript, so changing it requires a new frontend deployment.

## Backend Deployment: Render

The backend is an Express web service.

Use these Render service settings:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Required Render environment variables:

```env
MONGO_URI=<production MongoDB connection string>
JWT_SECRET=<long private secret>
JWT_EXPIRE=1d
NODE_ENV=production
PORT=5000
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
GEMINI_API_KEY=<optional Gemini API key>
GEMINI_MODEL=gemini-2.5-flash
```

Important: backend variables are runtime config. Changing them usually requires a backend restart or redeploy, not a Docker image rebuild.

## CI Before CD

GitHub Actions CI is defined in:

```text
.github/workflows/ci.yml
```

The current CI checks:

- Server dependencies install with `npm ci`.
- Client dependencies install with `npm ci`.
- Client lint passes with `npm run lint`.
- Client production build passes with `npm run build`.
- Backend Docker image builds.
- Frontend Docker image builds.

Recommended deployment rule:

```text
Do not deploy or merge if CI is red.
Deploy only when CI is green.
```

In Render, use auto-deploy behavior that waits for CI checks when available.

## Production Verification Checklist

After a deployment, verify:

```bash
curl -i https://cartify-backend-lg8z.onrender.com/health
curl -i "https://cartify-backend-lg8z.onrender.com/api/products?limit=1"
```

Expected results:

```text
/health returns HTTP 200 and {"status":"ok"}
/api/products?limit=1 returns HTTP 200 and product data
```

Then check the frontend:

```text
https://cartify-frontend-rouge.vercel.app
```

Manual browser checks:

- Homepage loads.
- Product list appears.
- Register and login work.
- Cart and checkout pages load.
- Orders page works after login.
- Admin pages work for admin users.
- Live order status still works through Socket.IO.

## Logs To Check

Use Vercel logs for frontend build/runtime issues:

```text
Vercel project -> Deployments -> selected deployment -> Logs
```

Use Render logs for backend deploy/runtime issues:

```text
Render service -> Logs
Render service -> Events -> selected deploy logs
```

Common backend log clues:

- Missing `MONGO_URI`, `JWT_SECRET`, or `CLIENT_URL`
- MongoDB connection errors
- CORS errors caused by an incorrect `CLIENT_URL`
- Request errors from `/api/products`, `/api/auth`, `/api/orders`

## Rollback Thinking

If a deployment breaks production:

1. Check whether CI passed for the deployed commit.
2. Check Render and Vercel logs.
3. Verify `/health`.
4. Verify `/api/products?limit=1`.
5. If the issue is an environment variable, fix the variable and redeploy.
6. If the issue is code, redeploy the last known good commit or use the platform rollback feature.

## Current Production Verification

Last verified manually from local machine:

```text
Frontend: HTTP 200
Backend /health: HTTP 200
Backend /api/products?limit=1: HTTP 200 with product data
```
