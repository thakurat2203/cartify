# Cartify Security And Production Readiness Checklist

Use this checklist before production deploys and during security reviews.

## What Production Readiness Means

Production readiness means the app is prepared to run for real users:

```text
secrets are protected
environment variables are correct
frontend and backend origins match
database access is controlled
errors and logs are useful
basic abuse protection exists
rollback path is known
```

## Secrets Handling

Never commit real secrets:

- `server/.env`
- `client/.env.local`
- MongoDB production connection strings
- JWT secrets
- Gemini API keys

Only commit examples:

- `server/.env.example`
- `client/.env.example`

Check ignored secret files:

```bash
git check-ignore -v server/.env client/.env.local
```

Check tracked env-like files:

```bash
git ls-files | grep -E '(^|/)\\.env(\\.|$)|\\.env\\.local$'
```

Expected:

```text
Only .env.example files should be tracked.
Real .env files should be ignored.
```

## Backend Required Environment Variables

Production Render backend:

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

`MONGO_URI`, `JWT_SECRET`, and production `CLIENT_URL` are required by `server/src/config/index.js`.

## Frontend Environment Variables

Production Vercel frontend:

```env
NEXT_PUBLIC_API_BASE_URL=https://cartify-backend-lg8z.onrender.com
```

Rules:

- `NEXT_PUBLIC_*` values are visible in browser JavaScript.
- Do not put secrets in `NEXT_PUBLIC_*`.
- Changing `NEXT_PUBLIC_API_BASE_URL` requires a new frontend deployment.

## CORS Readiness

Backend CORS should allow the correct frontend origin:

```env
CLIENT_URL=https://cartify-frontend-rouge.vercel.app
```

Local development:

```text
http://localhost:3000 is allowed.
```

Production:

```text
Only CLIENT_URL is allowed.
```

If frontend requests fail with CORS errors, check:

- Vercel frontend URL
- Render `CLIENT_URL`
- Browser Network tab
- Render backend logs

## Security Middleware

Current backend protections:

- `helmet()` sets common security headers.
- `cors()` restricts browser origins.
- `express-rate-limit` limits `/api` traffic.
- `express.json({ limit: "100kb" })` limits JSON body size.
- JWT middleware protects authenticated routes.
- Role middleware protects admin routes.
- Passwords are hashed with bcryptjs.

Current rate limit:

```text
300 API requests per 15 minutes per client
```

If users are blocked too aggressively, review the rate limit. If abuse increases, lower the limit or add stricter auth-specific limits.

## JWT Readiness

JWT checklist:

- Use a long, random `JWT_SECRET`.
- Keep `JWT_SECRET` only in backend environment variables.
- Never expose it to the frontend.
- Rotate it if it leaks.
- Understand that rotating it invalidates existing user tokens.

Recommended:

```text
Use at least 32 random characters for JWT_SECRET.
```

## MongoDB Readiness

MongoDB checklist:

- Use a production MongoDB service such as Atlas.
- Use a database user with only the permissions the app needs.
- Store the connection string in Render `MONGO_URI`.
- Do not commit the connection string.
- Confirm production data is backed up.
- Restrict network access where possible.

Smoke test:

```bash
curl -i "https://cartify-backend-lg8z.onrender.com/api/products?limit=1"
```

## Docker Readiness

Docker checklist:

- `.dockerignore` excludes `.env`.
- `.dockerignore` excludes `node_modules`.
- Images do not contain real secrets.
- Backend env values are passed at runtime.
- Frontend public API URL is passed at build time.
- Compose MongoDB data uses a volume.

Useful checks:

```bash
docker build -t cartify-server:check ./server
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:5000 -t cartify-client:check ./client
docker compose up --build -d
docker compose ps
```

## CI/CD Readiness

Before deploy:

- GitHub Actions CI is green.
- Client lint passes.
- Client build passes.
- Server dependencies install.
- Docker images build.

Deployment rule:

```text
Do not deploy if CI is red.
```

Render recommendation:

```text
Configure auto-deploy to wait for CI checks before deploying when available.
```

## Production Verification

After deploy:

```bash
curl -i https://cartify-backend-lg8z.onrender.com/health
curl -i "https://cartify-backend-lg8z.onrender.com/api/products?limit=1"
```

Expected:

```text
/health returns HTTP 200 and {"status":"ok"}
/api/products?limit=1 returns HTTP 200 and product data
```

Then manually test:

- Homepage
- Product list
- Register/login
- Cart
- Checkout
- Orders
- Admin dashboard
- Admin order status update
- Socket.IO order status update

## Rollback Readiness

Know how to recover if production breaks:

1. Check CI for the deployed commit.
2. Check Vercel deployment logs.
3. Check Render deployment/runtime logs.
4. Verify `/health`.
5. Verify `/api/products?limit=1`.
6. Fix env vars and redeploy if config is wrong.
7. Redeploy a known-good commit if code is broken.
8. Use Vercel/Render rollback features when appropriate.

## Current Review Notes

Current strengths:

- Real env files are ignored.
- Example env files are available.
- Backend fails fast when required env vars are missing.
- Helmet is enabled.
- CORS is configured.
- Rate limiting is enabled for `/api`.
- JSON body size is limited.
- Passwords are hashed.
- JWT auth and admin role checks exist.
- `/health` exists.
- CI exists.
- Docker and Compose exist.

Recent hardening:

```text
Production CORS now allows only the configured CLIENT_URL.
Localhost is allowed only outside production.
```
