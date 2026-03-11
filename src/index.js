const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const connectDB = require("./config/connection");
const setupGooglePassport = require("./config/passportGoogle");

const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const goalsRoutes = require("./routes/goals");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(logger);

app.use(passport.initialize());
setupGooglePassport(passport);

app.get("/", (req, res) => {
  res.send("Goals API running ✅");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/goals", goalsRoutes);

app.use(errorHandler);

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  });
});