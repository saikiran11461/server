const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  images: [{ type: String }], // URLs or filenames
  registrationForm: { type: Object },
  category: { type: String, default: "General" },
  status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, {
  timestamps: true,
  versionKey: false
});

const eventModel = mongoose.model("event", eventSchema);

module.exports = { eventModel };
