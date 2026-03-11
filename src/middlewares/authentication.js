const jwt = require("jsonwebtoken");

function authentication(req, res, next) {
  try {
    const authHeader = req.headers.authorization; // "Bearer <token>"
    if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid Authorization format" });
    }

    const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // attach to request for later use
    req.user = payload; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authentication;