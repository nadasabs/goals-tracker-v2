# middlewares > errorHandler.js
This file is a centralized error handling middleware for an Express + MongoDB (Mongoose) application.

Its purpose is to catch errors from anywhere in your app and return a clean response to the client instead of crashing the server.

Think of it as a global error manager.

## 1. Import Mongoose
```
const mongoose = require("mongoose");
```

This is needed because the middleware will detect Mongoose-specific errors like:
- Validation errors

- Invalid ObjectId errors

These errors come from MongoDB operations.

## 2. Create the Error Middleware
```
function errorHandler(err, req, res, next)
```
This special signature tells Express:

> "This middleware handles errors."

**Normal middleware**

```
(req, res, next)
```
**Error middleware:**

(err, req, res, next)

The first parameter err is the error object.

## 3. Default Error Values
```
let status = err.status || 500;
let message = err.message || "Internal Server Error";
```
This sets a default response.

Meaning:

If the error doesn't specify anything, return:

>500 Internal Server Error

Example response:
```
{
  "message": "Internal Server Error"
}
```
## 4. Handle Mongoose Validation Errors
```
if (err instanceof mongoose.Error.ValidationError)
```
This error occurs when schema validation fails.

Example schema:

```
const userSchema = new Schema({
  email: { type: String, required: true }
});
```
If someone sends:
```
{
  "name": "John"
}
```
Mongoose throws a ValidationError.

The Code
```
status = 400;
message = Object.values(err.errors).map((e) => e.message);
```
**Explanation:**

err.errors looks like this:
```
{
  email: {
    message: "Path `email` is required."
  }
}
```

Object.values() extracts the error objects.

.map() returns only the messages.

Final response:
```
{
  "message": [
    "Path `email` is required."
  ]
}
```
Status:

400 Bad Request
## 5. Handle Invalid MongoDB ID
```
if (err instanceof mongoose.Error.CastError)
```
This happens when MongoDB ObjectId format is invalid.

Example route:

> GET /users/abc123

But MongoDB expects:

> 507f1f77bcf86cd799439011

Mongoose throws a CastError.

Your middleware converts it to:
```
status = 400;
message = "Invalid ID format";
```
Response:
```
{
  "message": "Invalid ID format"
}
```
## 6. Send Error Response
```
res.status(status).json({ message });
```
Example outputs:
```
Validation error
{
  "message": [
    "Email is required"
  ]
}
Invalid ID
{
  "message": "Invalid ID format"
}
Unexpected error
{
  "message": "Internal Server Error"
}
```
## 7. Export the Middleware
```
module.exports = errorHandler;
```
This allows it to be used in the main server file.

## 8. How It Is Used in Your Server

Inside index.js / app.js

```
const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);
```
Important rule:

> ⚠️ This must be the last middleware in the app.

Example:

```
app.use("/api", routes);

app.use(errorHandler);
```
Why?

Because it catches errors from everything above it.

## 9. How Errors Reach This Middleware

Inside routes:

```
router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

next(err) sends the error to errorHandler.
```
Flow:

```
Request
   ↓
Route
   ↓
Error occurs
   ↓
next(err)
   ↓
errorHandler middleware
   ↓
Response
```
## 10. Why Centralized Error Handling Is Important

Without it you would write this everywhere:

```
try {
} catch (err) {
  res.status(500).json({ message: err.message });
}
```

This becomes messy and inconsistent.

Centralized error handling gives:

- Benefit	Explanation
- Cleaner routes	No repeated try/catch responses
- Consistent errors	Same format everywhere
- Easier debugging	All errors handled in one place
- Better scalability	Works for large apps
## 11. Real Example Flow

Request:

> GET /users/123

But 123 is not a valid ObjectId.

```
Flow:

Route
 ↓
Mongoose throws CastError
 ↓
next(err)
 ↓
errorHandler
 ↓
response
```

Response:
```
{
  "message": "Invalid ID format"
}
```
## 12. Small Improvement (Best Practice)

Most production APIs return structured errors like:
```
res.status(status).json({
  success: false,
  message
});
```

Example:
```
{
  "success": false,
  "message": "Invalid ID format"
}
```

This makes frontend handling easier.

### Final Mental Model

Think of this file as:
```
Global Error Manager
Route
 ↓
Something breaks
 ↓
next(err)
 ↓
Error Handler
 ↓
Clean response sent
```