const mongoose = require("mongoose");
const { setServers } = require("node:dns/promises");

/**
 * - sets DNS servers (optional)
 * - connects to MongoDB
 * - export a function so index.js can explicitly connect
 *   (more predictable, easier to debug)
 */


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