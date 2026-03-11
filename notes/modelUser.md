# User Model (User.js) — Beginner Explanation

This file defines the **User model** (how user data is stored in MongoDB).

It also contains an important security feature:

✅ **Before saving a user, hash the password** (so the database never stores the real password)

## 1) Import mongoose
```
const mongoose = require("mongoose");
```
Mongoose is the library that:
- connects Node.js ↔ MongoDB
- allows you to define schemas and models

## 2) Import bcrypt
```
const bcrypt = require("bcryptjs");
```
bcrypt is used for password security.

Instead of storing:
- "123456"

You store something like:
- "$2a$10$QbVg...."

That hashed password cannot be reversed back into the original password.

## 3) Define the UserSchema fields
✅ email
```
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
},
```
Meaning:
- type: String → must be text
- required: true → you MUST provide an email
- unique: true → two users cannot have the same email
- lowercase: true → saves email in lowercase (prevents duplicates like Test@...)
- trim: true → removes extra spaces around the email

This helps you avoid:
- " test@gmail.com " being treated as different from "test@gmail.com"

✅ password
```
password: {
  type: String,
  required: false,
  minlength: 6,
},
```
This is interesting:
- required: false means password is optional.
- That’s useful if you support Google login because Google users may not have a password.

However, this also means:
⚠️ A user could be created with no password even without Google.

So you must control this logic in your routes:
- Local register should require password
- Google login can create without password

## 4) timestamps
```
{ timestamps: true }
```
Automatically adds:
- createdAt
- updatedAt

So you can later sort users or audit when users were created.

# The Most Important Part: Password Hashing Hook
## 5) pre("save") hook
```
UserSchema.pre("save", function () {
```

This means:
> “Before any user is saved to MongoDB, run this function.”

It runs on:
- User.create()
- user.save()

It does NOT run on:
- User.updateOne()
- User.findByIdAndUpdate()
Important: If you update password using findByIdAndUpdate, hashing will NOT happen automatically.

## 6) Don’t hash unless password changed
```
if (!this.isModified("password")) return;
```

This prevents a big bug.

Without this check:
- Every time you update the user (even just changing name),
- it would re-hash the already-hashed password again,
- which breaks login.

So this line says:
> "Only hash if password is new or changed."

## 7) Generate salt
```
const salt = bcrypt.genSaltSync(10);
```

Salt is random data used to make hashing stronger.

The number 10 means:
- hashing strength / cost factor
- higher = more secure but slower

10 is a common default.

## 8) Hash the password
```
this.password = bcrypt.hashSync(this.password, salt);
```

This replaces the plain password with the hashed version.

So the database stores the hash, not the real password.

## 9) Export model
```
module.exports = mongoose.model("User", UserSchema);
```

This creates the model User and exports it.

MongoDB will store this in a collection named:

✅ users