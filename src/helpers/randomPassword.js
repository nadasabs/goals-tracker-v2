const crypto = require("crypto");

function generateRandomPassword(length = 12) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, length);
}

module.exports = generateRandomPassword;