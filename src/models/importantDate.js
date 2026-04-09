import mongoose from "mongoose";

const importantDateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  type: { type: String, enum: ["Ekadashi", "Festival", "Other"], default: "Other" },
}, { timestamps: true });

export default mongoose.model("ImportantDate", importantDateSchema);
