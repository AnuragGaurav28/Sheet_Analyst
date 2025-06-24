const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const uploadRoute = require("./routes/upload");
const analyzeRoute = require("./routes/analyze");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/upload", uploadRoute);
app.use("/api/analyze", analyzeRoute);
app.use("/api/admin", adminRoutes);

//Session middleware required by Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));


