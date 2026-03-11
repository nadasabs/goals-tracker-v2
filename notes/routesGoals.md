# Goals Routes (routes/goals.js) — Beginner Explanation

This file creates the **Goals API** (CRUD) and adds **security**.

It supports:

- ✅ Create a goal
- ✅ Get all goals
- ✅ Get one goal
- ✅ Update a goal
- ✅ Delete a goal

And it enforces:

✅ Only logged-in users can use these routes (**authentication**)  
✅ Users can only access their own goals (**ownership**)  


## Big Picture: How Requests Flow Here
When a request comes in (example GET /goals):
1. Express matches it to the correct route in this file
2. It runs the authentication middleware first
3. If token is valid → route runs
4. If token is missing/invalid → request stops with 401
5. If something fails inside the route → next(err) sends error to your global error handler

## Step-by-step Explanation
## 1) Imports
```
const express = require("express");
const Goal = require("../models/Goal");
const authentication = require("../middlewares/authentication");
```
- express → used to create router endpoints
- Goal → Mongoose model that talks to MongoDB goals collection
- authentication → checks JWT and sets req.user

## 2) Router
```
const router = express.Router();
```

This creates a router.
In index.js you mount it like:
```
app.use("/goals", goalsRoutes);
```
So all endpoints here are under /goals.
# CREATE — POST /goals
```
router.post("/", authentication, async (req, res, next) => { ... })
```
### What it does
Creates a new goal for the logged-in user.

### Why authentication is here
You don’t want strangers creating goals in your database.

If token is valid, middleware sets:
```
req.user = { id, email, ... }
```
### Required fields check
```
if (!title || !targetDate) ...
```
### The most important line
userId: req.user.id

This connects the goal to the user who is logged in.

### Why 201
201 means: “Created successfully”.

## READ ALL — GET /goals
```
const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
```

This is the ownership filter:

✅ User sees only goals where userId == their id.

Sorting:

- createdAt: -1 means newest first.

## READ ONE — GET /goals/:id
``` 
const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
```
This does two checks at once:
1. goal id matches URL
2. goal belongs to logged-in user

If it doesn’t belong to the user, this returns null, and you respond with 404.

This prevents:
✅ User B reading User A’s goal, even if they guess the goal ID.

## UPDATE — PUT /goals/:id
```
const updated = await Goal.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.id },
  { title, description, targetDate, status, progress },
  { new: true, runValidators: true }
);
```

### Filter (ownership)
Only updates if the goal belongs to the logged-in user.
### Options
- new: true → returns the updated goal, not the old one
- runValidators: true → enforces schema rules on updates (enum/min/max)
If nothing found, return 404.

### DELETE — DELETE /goals/:id
```
const deleted = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
```

Deletes only if:
- goal exists
- and it belongs to the logged-in user
Otherwise return 404.

```
Why every catch uses next(err)
catch (err) {
  next(err);
}
```

This sends the error to your global error handler (middlewares/errorHandler.js) so your app returns clean JSON errors.

# Summary (The Most Important Concepts)

✅ authentication ensures user is logged in
✅ req.user.id identifies who is logged in
✅ Every DB query includes userId: req.user.id to enforce ownership
✅ next(err) passes errors to a global handler

