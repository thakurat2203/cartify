# Cartify Admin Setup

Cartify registers new users with the `shopper` role by default. To access admin routes and admin pages, promote a trusted user to the `admin` role in MongoDB.

## Steps

1. Register a normal account through the app or `POST /api/auth/register`.
2. In MongoDB Shell, switch to your Cartify database.

```javascript
use ecommerce
```

3. Promote the user by email.

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

4. Log in again so the JWT contains the updated role.
5. Confirm the token has admin access by calling `GET /api/auth/me` or opening the admin pages.

## Notes

- Use a strong password for admin accounts.
- Do not expose an open public endpoint that promotes users to admin.
- In production, make the change through MongoDB Atlas or a locked-down internal script.
