const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String, required: true }], // URLs or filenames
  date: { type: Date, required: true },
  category: { type: String, default: "General" }, // e.g., "Daily Darshan", "Festival", etc.
  type: { type: String, enum: ["darshan", "festival", "seva", "community", "other"], default: "darshan" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, {
  timestamps: true,
  versionKey: false
});

const galleryModel = mongoose.model("gallery", gallerySchema);

module.exports = { galleryModel };
