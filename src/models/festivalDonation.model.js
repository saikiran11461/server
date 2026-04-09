const mongoose = require("mongoose");


const festivalDonationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // for URL
  description: { type: String },
  images: [{ type: String }],
  active: { type: Boolean, default: true },
  donationOptions: [{
    label: String, // e.g., "Annadaan Seva", "General Donation"
    amount: Number,
    description: String
  }],
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "event" }, // link to event
  meta: { type: Object }, // for UTM, SEO, etc.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, {
  timestamps: true,
  versionKey: false
});

const festivalDonationModel = mongoose.model("festivalDonation", festivalDonationSchema);

module.exports = { festivalDonationModel };
