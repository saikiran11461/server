const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "event", required: true },
  token: { type: String, required: true, unique: true },
  data: { type: Object, default: {} },
  files: [{ type: String }],
  paid: { type: Boolean, default: false },
  attendance: {
    present: { type: Boolean, default: false },
    at: { type: Date },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
  }
}, { timestamps: true, versionKey: false });

const registrationModel = mongoose.model("registration", registrationSchema);

module.exports = { registrationModel };
