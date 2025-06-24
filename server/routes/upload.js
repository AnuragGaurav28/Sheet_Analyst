const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");
const path = require("path");
const File = require("../models/File");

const fs = require("fs");
// ✅ Auth middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // ✅ use `req.userId`
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const savedName = `${Date.now()}-${file.originalname}`;
    cb(null, savedName);
  },
});

const upload = multer({ storage });

// ✅ Upload route
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ Save metadata to MongoDB
    const newFile = new File({
      userId: req.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    });

    await newFile.save(); // 👈 Save in DB

    res.status(201).json({
      message: "File uploaded successfully!",
      filename: req.file.filename, // 👈 Used by frontend for preview
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// ✅ Excel Preview route
router.get("/preview/:filename", verifyToken, async (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "uploads", req.params.filename);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    res.json(json);
  } catch (err) {
    res.status(500).json({ message: "Error parsing Excel file", error: err.message });
  }
});

// ✅ Get upload history for the logged-in user
router.get("/history", verifyToken, async (req, res) => {
  try {
    const files = await File.find({ userId: req.userId })
      .sort({ uploadedAt: -1 }) // most recent first
      .select("fileName originalName uploadedAt");

    res.json(files);
  } catch (err) {
    console.error("History fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch upload history", error: err.message });
  }
});

// ✅ Download file route
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "..", "uploads", req.params.filename);
  res.download(filePath, err => {
    if (err) res.status(404).json({ message: "File not found" });
  });
});

// ✅ Delete file route
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });
    if (!file) return res.status(404).json({ message: "File not found" });

    const filePath = path.join(__dirname, "..", "uploads", file.fileName);
    fs.unlinkSync(filePath); // Delete file from disk
    await file.deleteOne(); // Delete from database

    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

// 📊 GET: Upload Stats (Total files uploaded by user)
router.get("/upload-stats", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const count = await File.countDocuments({ userId });
    res.json({ count });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// 🕒 GET: Recent Uploads (Last 5 files)
router.get("/recent-uploads", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const recent = await File.find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(5);

    res.json(
      recent.map((file) => ({
        filename: file.originalName,
        uploadedAt: file.uploadedAt,
      }))
    );
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// ✅ DELETE: Clear upload history
router.delete("/clear-history", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await File.deleteMany({ userId: decoded.id });
    res.json({ message: "Upload history cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear upload history" });
  }
});

// GET: List filenames uploaded by the logged-in user 
router.get('/list-filenames', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const files = await File.find({ userId }).sort({ uploadedAt: -1 });

    // Return both original name and internal filename
    const fileList = files.map(file => ({
      originalName: file.originalName,
      fileName: file.fileName, // keep this if you need it for preview route
    }));

    res.json(fileList);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
