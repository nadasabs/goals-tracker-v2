const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authentication = require("../middlewares/authentication");
const generateRandomPassword = require("../helpers/randomPassword");
const { sendTempPasswordEmail } = require("../helpers/mailer");

const router = express.Router();

/**
 * REGISTER
 */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      provider: "local",
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        email: user.email,
        provider: user.provider,
        passwordReset: user.passwordReset,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        email: user.email,
        provider: user.provider,
        passwordReset: user.passwordReset,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET CURRENT USER
 */
router.get("/me", authentication, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * REQUEST PASSWORD RESET
 */
router.post("/request-password-reset", async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.provider === "google" && !user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const tempPassword = generateRandomPassword(12);

    user.password = tempPassword;
    user.passwordReset = true;
    await user.save();

    await sendTempPasswordEmail(user.email, tempPassword);

    res.json({ message: "Temporary password sent to email" });
  } catch (err) {
    next(err);
  }
});

/**
 * UPDATE PASSWORD
 */
router.put("/update-password", authentication, async (req, res, next) => {
  try {
    const { newPassword } = req.body || {};

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.passwordReset = false;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;