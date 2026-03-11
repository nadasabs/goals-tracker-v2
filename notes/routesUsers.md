# Users Routes (routes/users.js) — Beginner Explanation

This file creates two important endpoints:

1) ✅ **Register** a new user  
2) ✅ **Login** and get a JWT token  

That JWT token is what lets a user access protected routes like `/goals`.

---
## Big Picture: What This File Does
### Register flow
- Takes email + password
- Saves user in MongoDB
- Password is hashed automatically by your User model pre("save") hook
- Returns id + email (not password)

### Login flow
- Takes email + password
- Finds user by email
- Compares password with hashed password in DB
- Creates JWT token
- Returns token for use in Postman / frontend

## Step-by-step Explanation (Based on the Code Outline)
## 1) Imports
```
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
```

- express → builds routes like /register and /login
- bcryptjs → compares passwords safely
- jsonwebtoken → creates JWT tokens
- User → Mongoose model to talk to the users collection in MongoDB

## 2) Create router
```
const router = express.Router();
```

This router will be attached in index.js like:
```
app.use("/users", userRoutes);
```
So these routes become:
- POST /users/register
- POST /users/login

## Route 1: Register — POST /users/register
router.post("/register", async (req, res, next) => { ... })
### A) Read request body
```
const { email, password } = req.body || {};
```

- req.body contains JSON from Postman.
- || {} prevents crash if req.body is undefined.

### B) Validate inputs
``` 
if (!email || !password) {
  return res.status(400).json({ message: "Email and password are required" });
}
```

If someone forgets email/password:
- Return 400 (bad request)
- Stop here using return

### C) Create user in database
```
const user = await User.create({ email, password });
```
This saves the user in MongoDB.

Important: because your User model has a pre("save") hook:

✅ the password gets hashed BEFORE it is saved.

So MongoDB stores a hashed password, not plain text.

### D) Return response (no password)
```
res.status(201).json({ id: user._id, email: user.email });
```
- 201 means “Created”
- You purposely do not send password back to the client.

### E) Catch errors
```
catch (err) {
  next(err);
}
```

This sends any error to your global error handler (errorHandler.js).

Example errors:
- duplicate email (unique constraint)
- database down
- validation errors

## Route 2: Login — POST /users/login
```
router.post("/login", async (req, res, next) => { ... })
```

### A) Read body + validate

Same as register:
- must have email + password
- if not → 400

### B) Find user by email
```
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: "Invalid email or password" });
```
- If user doesn't exist → return 401.
- Notice: you return the same message as wrong password.

Why? ✅ It prevents attackers from learning which emails exist.

### C) Compare passwords
```
const isMatch = bcrypt.compareSync(password, user.password);
if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });
```
- password = what user typed now (plain text)
- user.password = hashed password stored in DB

bcrypt checks if they match.

If not match → 401.

### D) Create JWT token
```
const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

This creates a token that includes:
- user id
- user email

And signs it with your secret so nobody can fake it.

The token expires in 7 days.

### E) Return token
```
res.json({ id: user._id, email: user.email, token });
```
Now the client (Postman or frontend) stores the token and uses it as:
``` Authorization: Bearer <token> ```

to access protected routes like /goals.

# What Should Remember Most

✅ Register:
- saves user
- password is hashed (thanks to model hook)
- returns id/email only

✅ Login:
- finds user
- checks password using bcrypt
- creates JWT token
- returns token

✅ That token is what makes req.user possible later in authentication middleware.