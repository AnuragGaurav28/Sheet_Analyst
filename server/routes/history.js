const express = require("express");
const router = express.Router();
const File = require("../models/File");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const history = await File.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;
