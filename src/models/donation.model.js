const mongoose = require("mongoose");


const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String },
  donorMobile: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, default: "General" }, // e.g., "Anna Daan", "Seva", etc.
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  message: { type: String },
  transactionId: { type: String },
  festivalId: { type: mongoose.Schema.Types.ObjectId, ref: "festivalDonation" },
  festivalSlug: { type: String },
  panNumber: { type: String },
  certificate: { type: Boolean, default: false },
  wantPrasadam: { type: Boolean, default: false },
  prasadamAddress: {
    doorNo: String,
    house: String,
    street: String,
    area: String,
    country: { type: String, default: 'India' },
    state: String,
    city: String,
    pincode: String,
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  subscriptionId: { type: String },
  isRecurring: { type: Boolean, default: false },
  receiptNumber: { type: String },
  receiptGeneratedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, {
  timestamps: true,
  versionKey: false
});

donationSchema.index({ festivalId: 1 });
donationSchema.index({ date: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ razorpayOrderId: 1 });
donationSchema.index({ donorMobile: 1 });

const donationModel = mongoose.model("donation", donationSchema);

module.exports = { donationModel };
