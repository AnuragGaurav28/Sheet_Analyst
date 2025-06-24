const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const File = require("../models/File");

// ✅ Middleware to check admin token and role
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAdmin) return res.status(403).json({ message: "Access denied" });

    req.admin = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

//
// 📌 GET: All Users (without password)
//
router.get("/users", isAdmin, async (req, res) => {
  const users = await User.find({}, "-password");
  res.json(users);
});

//
// 📌 GET: All Files (with email of uploader)
//
router.get("/files", isAdmin, async (req, res) => {
  const files = await File.find().populate("userId", "email");
  res.json(
    files.map((f) => ({
      id: f._id,
      filename: f.originalName,
      uploadedBy: f.userId?.email || "Unknown",
      uploadedAt: f.uploadedAt,
    }))
  );
});

//
// 📌 GET: Admin Dashboard Stats
//
router.get("/stats", isAdmin, async (req, res) => {
  const userCount = await User.countDocuments();
  const fileCount = await File.countDocuments();
  const adminCount = await User.countDocuments({ isAdmin: true });

  res.json({ users: userCount, files: fileCount, admins: adminCount });
});

//
// 📌 GET: Recent Uploads (latest 5)
//
router.get("/recent", isAdmin, async (req, res) => {
  const recentUploads = await File.find()
    .sort({ uploadedAt: -1 }) // Use uploadedAt — you defined this in schema
    .limit(5)
    .populate("userId", "email");

  res.json(
    recentUploads.map((f) => ({
      id: f._id,
      filename: f.originalName,
      uploadedBy: f.userId?.email || "Unknown",
      uploadedAt: f.uploadedAt,
    }))
  );
});

//
// 📌 GET: File Upload Trends
//
router.get("/trends", isAdmin, async (req, res) => {
  const trends = await File.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" }, // ✅ Use uploadedAt
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(trends);
});

//
// 📌 DELETE: User
//
router.delete("/users/:id", isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

//
// 📌 DELETE: File
//
router.delete("/files/:id", isAdmin, async (req, res) => {
  await File.findByIdAndDelete(req.params.id);
  res.json({ message: "File deleted" });
});

module.exports = router;
