const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String }, // Optional name field for OAuth signups
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Use "google_oauth"/"github_oauth" for OAuth users
  isAdmin: { type: Boolean, default: false },

  // For Forgot Password functionality
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model("User", userSchema);
