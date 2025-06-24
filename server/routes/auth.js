const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const File = require("../models/File");

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Include isAdmin in the response
    res.json({ token, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register route (optional)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashed });
    res.status(201).json({ message: "User created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();
  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
  });

  res.json({ message: "Reset link sent to email." });
});

// Login With Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Save or find user in DB
  let user = await User.findOne({ email: profile.emails[0].value });
  if (!user) {
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      password: "google_oauth"
    });
  }
  done(null, user);
}));

router.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    // ✅ redirect after login
    res.redirect("http://localhost:5173/dashboard");
  }
);

// Login With GitHub
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const dummyEmail = profile.username + "@github.com"; // dummy email
  let user = await User.findOne({ email: dummyEmail });
  if (!user) {
    user = await User.create({
      name: profile.displayName || profile.username,
      email: dummyEmail,
      password: "github_oauth"
    });
  }
  done(null, user);
}));

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

// ✅ Serialize and deserialize user for session support
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// ✅ PATCH: Update user name
router.patch("/update-name", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    await user.save();

    res.json({ message: "Name updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update name" });
  }
});

// ✅ POST: Change password
router.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// ✅ DELETE: Delete account
router.delete("/delete-account", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await File.deleteMany({ userId: decoded.id }); // Remove user files
    await User.findByIdAndDelete(decoded.id); // Delete user

    res.json({ message: "Account deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// 📦 GET: Profile info
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;
    User.findById(id)
      .select("name email")
      .then(user => {
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ name: user.name, email: user.email });
      })
      .catch(() => res.status(500).json({ message: "Server error" }));
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});



module.exports = router;
