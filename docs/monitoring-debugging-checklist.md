# Cartify Monitoring And Debugging Checklist

Use this checklist after deployments and whenever production behaves unexpectedly.

## What Monitoring Means

Monitoring answers:

```text
Is the app alive?
Is the app healthy?
Can users complete real workflows?
Where do errors show up?
```

For Cartify, the first monitoring signals are:

- Vercel frontend deployment status
- Render backend deployment status
- Backend `/health`
- Product API smoke test
- Vercel frontend logs
- Render backend logs

## Quick Production Checks

Run these after every deploy:

```bash
curl -i https://cartify-backend-lg8z.onrender.com/health
curl -i "https://cartify-backend-lg8z.onrender.com/api/products?limit=1"
```

Expected:

```text
/health returns HTTP 200 and {"status":"ok"}
/api/products?limit=1 returns HTTP 200 and product data
```

Open the frontend:

```text
https://cartify-frontend-rouge.vercel.app
```

Expected:

```text
Homepage loads.
Product list appears.
No obvious browser console or network errors.
```

## Manual Production Verification

Check these user flows:

- Homepage loads.
- Product search/filter/sort works.
- Product detail page loads.
- Register works.
- Login works.
- Cart add/remove/update quantity works.
- Checkout creates an order.
- Orders page shows customer orders.
- Order detail page loads.
- Admin dashboard loads for admin users.
- Admin product create/edit/delete works.
- Admin order status update works.
- Customer order detail receives live Socket.IO status update.
- AI shopping assistant returns useful results or fallback results.

## Where To Check Logs

Frontend logs:

```text
Vercel project -> Deployments -> selected deployment -> Logs
```

Backend logs:

```text
Render service -> Logs
Render service -> Events -> selected deploy logs
```

Browser-side errors:

```text
Browser DevTools -> Console
Browser DevTools -> Network
```

## Debugging By Symptom

### Frontend URL Does Not Load

Check:

- Vercel deployment status
- Vercel build logs
- Vercel runtime logs
- Correct root directory: `client`
- Correct build command: `npm run build`
- Correct environment variable: `NEXT_PUBLIC_API_BASE_URL`

Likely areas:

```text
Next.js build failure
Missing frontend environment variable
Wrong Vercel project root
Deployment still in progress
```

### Frontend Loads But Products Do Not

Check:

- Browser DevTools Network tab
- Request URL for `/api/products`
- Backend `/health`
- Backend `/api/products?limit=1`
- Vercel `NEXT_PUBLIC_API_BASE_URL`
- Render backend logs
- Render `CLIENT_URL`

Likely areas:

```text
Frontend points to wrong backend URL
Backend is down
CORS rejects frontend origin
MongoDB connection failed
Products collection is empty
```

### Backend `/health` Fails

Check:

- Render service status
- Render deploy logs
- Render runtime logs
- Start command: `npm start`
- Root directory: `server`
- Required environment variables

Likely areas:

```text
Backend process crashed
Missing MONGO_URI
Missing JWT_SECRET
Missing CLIENT_URL when NODE_ENV=production
MongoDB connection failure during startup
```

### `/health` Works But `/api/products` Fails

Check:

- Render backend logs
- `MONGO_URI`
- MongoDB Atlas network access
- MongoDB user/password
- Product route/controller/service
- Product collection data

Likely areas:

```text
Express process is alive
Database path or product query is failing
```

### Login/Register Fails

Check:

- Browser Network request to `/api/auth/login` or `/api/auth/register`
- Response status and error body
- Render logs
- `JWT_SECRET`
- MongoDB users collection
- Request body validation errors

Likely areas:

```text
Invalid form data
User already exists
JWT secret missing or changed
Database write/read issue
```

### Admin Pages Fail

Check:

- Logged-in user role
- Browser Network response status
- Backend auth middleware logs/errors
- JWT token in request
- `role` field in MongoDB user document

Likely areas:

```text
User is not admin
Expired or invalid token
Frontend route guard redirects
Backend admin middleware rejects request
```

### Socket.IO Live Updates Fail

Check:

- Browser DevTools Network -> WS/WebSocket
- Backend Render logs
- `NEXT_PUBLIC_API_BASE_URL`
- `CLIENT_URL`
- User token
- Order id

Likely areas:

```text
WebSocket connection blocked
CORS origin mismatch
Invalid token
User is not allowed to join the order room
Backend instance restarted
```

### AI Assistant Fails

Check:

- Browser Network request to `/api/ai/shopping-assistant`
- Render backend logs
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- Product data availability

Expected fallback:

```text
If Gemini is unavailable, the backend should still return fallback product recommendations.
```

## Environment Variable Checklist

Vercel frontend:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

Render backend:

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

## Debugging Order

Use this order to avoid guessing:

1. Check CI status for the deployed commit.
2. Check platform deployment status.
3. Check backend `/health`.
4. Check one real API smoke test.
5. Check frontend Network tab.
6. Check backend logs.
7. Check frontend logs.
8. Check environment variables.
9. Check database connectivity/data.
10. Roll back if production is broken and the fix is not immediate.

## Current Verification

Last verified manually from local machine:

```text
Frontend: HTTP 200
Backend /health: HTTP 200
Backend /api/products?limit=1: HTTP 200 with product data
```
