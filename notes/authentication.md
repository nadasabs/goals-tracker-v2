# Middlewares > Authentication
This file is a JWT authentication middleware for an Express app.
It protects routes so only logged-in users with a valid token can access them.

Let’s break it down step-by-step so you clearly understand what every line does and why it exists.

# 1. Import the JWT Library
```V
const jwt = require("jsonwebtoken");
```
This loads the jsonwebtoken package.

Purpose:

- Create tokens → jwt.sign()

- Verify tokens → jwt.verify()

Example token payload:
```
{
  "id": "12345",
  "email": "user@email.com",
  "iat": 1712345678,
  "exp": 1712350000
}
```

Where:
- Field	Meaning
- id	user id
- email	user email
- iat	issued at
- exp	expiration
##2. Create Middleware Function
function authentication(req, res, next) {

This is Express middleware.

Meaning:

It runs before the route handler.

### Flow in Express:
```
Request
   ↓
Middleware
   ↓
Route Controller
   ↓
Response
```

Example:
Client → authentication middleware → /goals route → response
## 3. Get Authorization Header
```
const authHeader = req.headers.authorization;
```
This reads the header sent by the client.

Example request header:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Format is always:

- Bearer (token)

Example:
```
Bearer abc123xyz456
```
## 4. Check if Header Exists
if (!authHeader) 
  return res.status(401).json({ message: "Missing Authorization header" });

If the request doesn't include a token, reject it.

Response:

> 401 Unauthorized

Example scenario:

User tries to access:

1) GET /goals

2) but didn't send token.

Result:
```
{
  "message": "Missing Authorization header"
}
```
## 5. Split the Header
```
const parts = authHeader.split(" ");
```

Example header:

> Bearer abc123

After split:

["Bearer", "abc123"]
## 6. Validate Format
```
if (parts.length !== 2 || parts[0] !== "Bearer") {
```
This checks if the format is correct.

Valid:

> Bearer abc123

Invalid examples:

```
abc123
Bearerabc123
Token abc123 
```

If invalid:

```
return res.status(401).json({ message: "Invalid Authorization format" });
```

## 7. Extract the Token
const token = parts[1];

Now we get:

> abc123

From:

Bearer abc123
## 8. Verify the Token
```
const payload = jwt.verify(token, process.env.JWT_SECRET);
```
This checks if the token:
- was signed by your server
- is not expired
- was not modified

The secret must match the one used when the token was created.

Example .env:

> JWT_SECRET=my_super_secret_key

If the token is valid → returns payload:

```
{
  id: "12345",
  email: "user@email.com",
  iat: 1712345678,
  exp: 1712350000
}
```

If invalid → throws error.

## 9. Attach User to Request
```
req.user = payload;
```
Now every route after this middleware can access the user.

Example route:

```
router.get("/profile", authentication, (req, res) => {
  res.json(req.user);
});
```
Result:

{
  "id": "12345",
  "email": "user@email.com"
}

This is extremely useful because now you know who is making the request.

## 10. Continue to Next Middleware
```
next();
```
This tells Express:

Authentication passed
Continue to the next step

``` 
Flow:

Request
 ↓
authentication middleware
 ↓
controller
 ↓
response
```
## 11. Catch Invalid Token Errors
```
catch (err) {
  return res.status(401).json({ message: "Invalid or expired token" });
}
```

If the token is:

- expired
- tampered
- invalid

the request is rejected.

Response:

```
{
  "message": "Invalid or expired token"
}
```
## 12. Export Middleware
```
module.exports = authentication;
```

Now other files can use it.

Example:

const authentication = require("../middleware/authentication");
How It Is Used in Routes

Example protected route:

```
router.get("/goals", authentication, async (req, res) => {
  const goals = await Goal.find({ userId: req.user.id });
  res.json(goals);
});
```

```
Flow:

Client Request
   ↓
authentication middleware
   ↓
token verified
   ↓
req.user created
   ↓
controller runs
Real Request Example
Login
POST /login
```

Response:
```
{
  "token": "abc123xyz"
}
```
Request to Protected Route
> GET /goals

Headers:

```
Authorization: Bearer abc123xyz
Visual Flow
Client
   │
   │ Request with Token
   ▼
Authentication Middleware
   │
   │ Verify JWT
   ▼
Attach User → req.user
   │
   ▼
Route Controller
   │
   ▼
Response
```
Why This Middleware Is Very Important

Without it, Anyone could access:

- GET /users
- GET /goals
- DELETE /account

With JWT authentication:

- Only logged-in users with valid tokens can access protected routes.