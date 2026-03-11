const User = require("../models/User");

async function checkPasswordReset(req, res, next) {
  try {
    if (!req.user?.id) return next();

    const user = await User.findById(req.user.id).select("passwordReset");
    if (user?.passwordReset) {
      return res.status(403).json({
        message: "Password reset required. Please update your password.",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkPasswordReset;