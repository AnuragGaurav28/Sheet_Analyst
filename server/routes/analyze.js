const express = require("express");
const router = express.Router();

// Dummy test endpoint for now
router.get("/", (req, res) => {
  res.json({ message: "Analyze route working" });
});

module.exports = router;
