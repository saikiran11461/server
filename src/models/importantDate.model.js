const mongoose = require("mongoose");

const importantDateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  type: { type: String, enum: ["Ekadashi", "Festival", "Other"], default: "Other" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
}, {
  timestamps: true,
  versionKey: false
});

const importantDateModel = mongoose.model("importantDate", importantDateSchema);

module.exports = { importantDateModel };
