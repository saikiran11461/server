
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
}, {
    timestamps: true,
    versionKey: false
});


const userModel = mongoose.model("user", userSchema);

module.exports = { userModel}