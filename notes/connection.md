# Config > Connection.js

```
const mongoose = require("mongoose");
const { setServers } = require("node:dns/promises");

async function connectMongo() {
  setServers(["1.1.1.1", "8.8.8.8"]);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectMongo;
```

## 1) Import Mongoose
```
const mongoose = require("mongoose");
```
- mongoose helps Node.js talk to MongoDB.

- It also lets you define models (like User, Goal) using schemas.

- Think of it like a translator between JavaScript and MongoDB.

## 2) Import DNS setServers
```
const { setServers } = require("node:dns/promises");
```
- This is built into Node.js.

- DNS is how your computer converts domain names into IP addresses.

- Setting DNS servers can help if your normal DNS is unreliable.

You are forcing Node to use:

- 1.1.1.1 (Cloudflare DNS)

- 8.8.8.8 (Google DNS)

> ⚠️ This is usually only useful for MongoDB Atlas (mongodb+srv://...), not local MongoDB.

## 3) Create the connectMongo() function
```
async function connectMongo() {
```

- async means you can use await inside.

- This function returns a promise, which helps you control startup order.

## 4) Set DNS servers
```
setServers(["1.1.1.1", "8.8.8.8"]);
```
- This sets DNS servers Node will use for lookups.

- Because this is the promises version, it’s safer to use:

# 5) Try to connect to MongoDB
```
await mongoose.connect(process.env.MONGO_URI);
```
- process.env.MONGO_URI comes from your .env file.

- mongoose.connect() actually opens the database connection.

If successful:

- console.log("✅ MongoDB connected");

If it fails:

- process.exit(1);

This immediately stops the app, because running an API with no database connection is useless.

# 6) Export function
- module.exports = connectMongo;

- So your index.js can do something like:

```
const connectMongo = require("./config/connection");
await connectMongo();
```