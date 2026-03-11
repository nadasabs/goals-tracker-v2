const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    passwordReset: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

UserSchema.pre("validate", function (next) {
  if (this.provider === "local" && !this.password) {
    this.invalidate("password", "Path `password` is required.");
  }
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();

  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);

  next();
});

module.exports = mongoose.model("User", UserSchema);