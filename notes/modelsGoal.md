# Models Goal

A **model** is basically:
- the “rules” for how your data must look in MongoDB
- and the tool you use to run database commands like:
  - `Goal.create()`
  - `Goal.find()`
  - `Goal.findById()`
  - `Goal.findOneAndUpdate()`


## 1) Import mongoose
```
const mongoose = require("mongoose");
```
This gives you access to:
- mongoose.Schema (to define structure)
- mongoose.model (to create a model)
- ObjectId types and MongoDB features

## 2) Create a Schema (the “shape” and rules)
```
const GoalSchema = new mongoose.Schema(...)
```
Think of a schema like a form template:
> “Every Goal must follow these rules.”

If you try to save a goal that breaks the rules, Mongoose can throw a validation error.

## 3) Fields inside the schema
### ✅ userId (ownership)
```
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
```

This means:
- Every goal must belong to a user.
- The type must be an ObjectId (MongoDB ID).
- ref: "User" means this ObjectId is pointing to the User model.

So your goal will look like:
```
{
  "userId": "65fd....",
  "title": "...",
  ...
}
```
Why this matters
This is what makes your app secure:
- User A only sees goals with userId = UserA_ID
- User B only sees goals with userId = UserB_ID

### ✅ title
```
title: { type: String, required: true, trim: true },
```
- Must be a string
- Must exist (required: true)
- trim: true removes spaces at the start/end

Example:

```
" run daily " becomes "run daily"
```

### ✅ description
```
description: { type: String, default: "", trim: true },
```
- Optional
- If not provided, it becomes "" (empty string)

So if you send only title and targetDate, your goal still saves successfully.

### ✅ targetDate
```
targetDate: { type: Date, required: true },
```
- Must be a valid Date
- Required
- This is usually the “deadline” or “target finish date”

In Postman you typically send:
```
"targetDate": "2026-03-30"
```
Mongoose converts it into a real Date object.

### ✅ status
``` status: {
  type: String,
  enum: ["not_started", "in_progress", "completed"],
  default: "not_started",
},
```

This means:
- status must be one of these exact words
- If you try "done" it will fail validation
- If you don’t send status, it becomes "not_started"

This prevents messy data like:
- "Completed"
- "complete"
- "done"
- "finished"

You only allow 3 clean values.

### ✅ progress
```
progress: { type: Number, min: 0, max: 100, default: 0 },
```
- Must be a number
- Minimum = 0
- Maximum = 100
- Default is 0

This prevents:
- negative progress
- progress above 100

## 4) timestamps option
```
{ timestamps: true }
```
This automatically adds two fields:
- createdAt
- updatedAt

You don’t need to manually set them.

This is super useful for sorting like:
```
Goal.find().sort({ createdAt: -1 })
```
## 5) Create and export the model
```
module.exports = mongoose.model("Goal", GoalSchema);
```

This creates a model called Goal.

MongoDB will store this in a collection named:

> ✅ goals (Mongoose makes it lowercase and plural)

Now in routes you can do:
- Goal.create(...)
- Goal.find(...)