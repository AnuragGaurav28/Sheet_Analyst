const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
},
{ timestamps: true } 
);

module.exports = mongoose.model("File", fileSchema);
