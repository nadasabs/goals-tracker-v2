# Main Server File (src/index.js)

This is the **main entry file** of your backend.

Step-by-step Explanation (Based on the Code Outline)

## 1) Import Express
```
const express = require("express");
```
Express is the framework that lets you build an API with routes like:
- GET /goals
- POST /users/login

## 2) Load environment variables
```
require("dotenv").config();
```
This reads your .env file and loads values into process.env.

Example:
- process.env.MONGO_URI
- process.env.JWT_SECRET
- process.env.GOOGLE_CLIENT_ID

Without this line, process.env.JWT_SECRET would be undefined and JWT would break.

## 3) Import your own modules (your project files)
```
const connectDB = require("./config/connection");
const goalsRoutes = require("./routes/goals");
const userRoutes = require("./routes/users");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./middlewares/logger");
```
- connectDB → connects to MongoDB
- goalsRoutes → all endpoints under /goals
- userRoutes → register + login under /users
- errorHandler → catches errors and returns JSON messages
- logger → prints request logs in terminal

## 4) Import Passport + Google setup
```
const passport = require("passport");
const setupGooglePassport = require("./config/passportGoogle");
const authRoutes = require("./routes/auth");
```
This is for Google OAuth login.
- passport.initialize() turns passport on
- setupGooglePassport(passport) registers the Google strategy
- authRoutes contains /auth/google and /auth/google/callback

## Create the Express app
```
const app = express();
```
This creates your server “application”.

Middlewares (these run BEFORE routes)
## 5) JSON Body Parser
```
app.use(express.json());
```
This is critical.

It converts incoming JSON into:

✅ req.body

Without this, req.body will be undefined and your POST requests fail.

## 6) Logger middleware
```
app.use(logger);
```
This logs every request like:
- GET /goals 200 - 7ms
- POST /users/login 401 - 2ms

It’s placed early so it logs everything (users, goals, auth).

## Passport setup (Google OAuth)
## 7) Start passport
```
app.use(passport.initialize());
```
Passport needs initialization middleware before you can use it.

## 8) Register Google strategy
```
setupGooglePassport(passport);
```

This attaches your GoogleStrategy to passport.

After this line, passport understands:

✅ passport.authenticate("google")

## 9) Mount auth routes
```
app.use("/auth", authRoutes);
```
This means:

Inside authRoutes you have:

- /google

- /google/callback

But because you mount it on /auth, the full URLs become:

- GET /auth/google

- GET /auth/google/callback

## Routes (endpoints)
## 10) Home route
```
app.get("/", (req, res) => res.send("Goals API running ✅"));
```
This is a simple “health check” to confirm server is running.

## 11) Users routes
```
app.use("/users", userRoutes);
```

This mounts your user router.

So userRoutes endpoints become:
- POST /users/register
- POST /users/login

## 12) Goals routes
```
app.use("/goals", goalsRoutes);
```
So goalsRoutes endpoints become:
- POST /goals
- GET /goals
- PUT /goals/:id
- etc.

These are protected because the routes themselves use authentication.

Error Handler (must be last)
## 13) Global error handler
```
app.use(errorHandler);
```

This MUST come after routes.

Why?

Because Express only sends errors to error middleware if:

- an error happens and you call next(err)

- or an error is thrown in async route and caught and passed to next

So if you put errorHandler early, it won’t catch route errors correctly.

## Database connection + server start
## 14) Connect to MongoDB first, then start server
```
connectDB().then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });
});
```
This ensures order:
1. ✅ connect to MongoDB
2. ✅ only after DB is ready, start listening

This prevents a common beginner bug:
- server accepts requests
- but DB isn't connected
- requests fail randomly

## Request Flow Example (How everything ties together)
**Example:** ```GET /goals```
1. express.json() runs (does nothing for GET)
2. logger runs and starts timer
3. Route matches /goals → goalsRoutes
4. authentication middleware checks JWT
5. Route queries DB with Goal.find({ userId: req.user.id })
6. Response is sent
7. logger prints status code + duration
8. If any error happens → next(err) → errorHandler returns JSON

# Summary
- This file is the “traffic controller”:

- sets up tools (middlewares)

- connects routes

- handles auth (passport)

- starts DB and server

- catches errors globally