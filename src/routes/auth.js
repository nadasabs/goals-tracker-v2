const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Start Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/google/failure" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
      return res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
    }

    return res.json({
      message: "Google login success",
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        provider: req.user.provider,
      },
    });
  }
);

// Failure route
router.get("/google/failure", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    return res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
  res.status(401).json({ message: "Google authentication failed" });
});

module.exports = router;