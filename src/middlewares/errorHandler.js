const mongoose = require("mongoose");

function errorHandler(err, req, res, next) {
  console.error("ERROR HANDLER CAUGHT:", err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message);
  }

  if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    status = 409;
    message = "Duplicate value error";
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;