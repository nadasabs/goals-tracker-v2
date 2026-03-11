# Auth Routes (auth.js) — Google OAuth + JWT (Beginner Explanation)

This file defines the **Google login routes**.

It has two endpoints:

1) `GET /auth/google`  
   ✅ starts the Google login process (redirects you to Google)

2) `GET /auth/google/callback`  
   ✅ Google redirects back here after you login  
   ✅ Passport gives you `req.user`  
   ✅ you create a JWT token  
   ✅ you return JSON (or redirect to frontend later)

---

## Big Picture: What Happens When You Login with Google

Google login is not like Postman login.

It is a redirect flow:

1. You open a browser and visit:

- - GET /auth/google

2. Server redirects you to Google login screen

3. You login and approve permissions

4. Google redirects back to your server:

- - GET /auth/google/callback?code=...

5. Passport verifies the code with Google, gets profile info

6. Passport gives you a req.user (your MongoDB user)

7. Your route generates a JWT token

8. You return the token to use in Postman/API requests

# Step-by-step Explanation (Based on the Code Outline)
## 1) Imports
```
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
```
- express: used to create routes

- passport: handles Google OAuth and gives you req.user

- jsonwebtoken: creates the JWT token used to access protected endpoints like /goals

## 2) Create a router
```
const router = express.Router();
```
This creates a mini “route group”.
Later in index.js you mount it like:

```
app.use("/auth", authRoutes);
```
So routes become:
- /auth/google
- /auth/google/callback

## 3) Route #1 — Start Google login
```
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
```
### What this does

When you visit:

GET /auth/google

Passport will:
- redirect you to Google
- ask permission for profile and email

### Why scope matters
- "profile" gives name and basic profile info
- "email" gives the user email address
(you usually need email to identify users in your database)

### Why session: false
Passport can work in 2 styles:
- Session-based (cookies + server session)
- Token-based (JWT)

Since your API uses JWT tokens, you’re saying:
✅ “Don’t use sessions, we use tokens.”

## 4) Route #2 — Google callback
```
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => { ... }
);
```
This route is the “return point”.

After user logs in on Google, Google redirects to this route.

### What Passport does here
- it reads Google’s code=... query param
- it exchanges that code for Google profile info
- it runs your GoogleStrategy callback in passportGoogle.js
- that strategy returns a user from MongoDB
- Passport places that user into:

✅ req.user

## 5) Create your JWT token
```
const token = jwt.sign(
  { id: req.user._id, email: req.user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```
### What this means
- You are creating a signed token containing:
- - user id
- - user email
- It is signed with JWT_SECRET so nobody can fake it.
- It expires in 7 days.

That token is what you paste into Postman as Bearer token.

### 6) Return JSON response (for testing)
```
return res.json({
  message: "Google login success",
  token,
  user: { id: req.user._id, email: req.user.email },
});
```
This is why your browser shows a JSON object after login.

It makes testing easy because you can:
- copy token
- test /goals in Postman

## 7) Optional redirect to frontend (later)
```
 // res.redirect(`http://localhost:5173/google-success?token=${token}`);
```

Once you have a frontend:
- You don’t want to show JSON
- You want to redirect to your website and pass the token
(or better: set a cookie)

## Important Notes

✅ Where does req.user come from?

From Passport.

Specifically:

- /auth/google/callback runs passport.authenticate("google")
- Passport runs your Google strategy
- Strategy returns user with done(null, user)
- Passport puts that into req.user

✅ Why do we generate a JWT if we already logged into Google?

Because Google login proves the user is real, but your API still needs a way to identify them on future requests.

JWT = your API’s “login badge” for future requests.

So later when user calls:

- GET /goals

Your auth middleware checks the JWT token and knows who they are.

# Summary

- /auth/google starts Google login (redirects you to Google).
- /auth/google/callback is where Google returns to your server.
- Passport fills req.user.
- You generate a JWT token.
- You return token so Postman can access protected routes.